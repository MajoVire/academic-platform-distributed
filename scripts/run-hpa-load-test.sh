#!/usr/bin/env bash
set -Eeuo pipefail

NAMESPACE="${NAMESPACE:-academic-platform}"
HPA_NAME="${HPA_NAME:-recommendation-worker}"
DEPLOYMENT_NAME="${DEPLOYMENT_NAME:-recommendation-worker}"
WORKER_LABEL="${WORKER_LABEL:-app.kubernetes.io/name=recommendation-worker}"
HPA_FILE="${HPA_FILE:-k8s/recommendation-worker-hpa.yaml}"
LOAD_SCRIPT="${LOAD_SCRIPT:-scripts/load-test-recommendation-worker.sh}"
RABBITMQ_SERVICE="${RABBITMQ_SERVICE:-rabbitmq}"
RABBITMQ_HOST="${RABBITMQ_HOST:-127.0.0.1}"
RABBITMQ_PORT="${RABBITMQ_PORT:-15672}"
RABBITMQ_USERNAME="${RABBITMQ_USERNAME:-academic_platform_rabbitmq}"
RABBITMQ_PASSWORD="${RABBITMQ_PASSWORD:-change_this_rabbitmq_password}"
TOTAL_MESSAGES="${TOTAL_MESSAGES:-1000}"
CONCURRENCY="${CONCURRENCY:-8}"
MONITOR_INTERVAL="${MONITOR_INTERVAL:-3}"
POST_LOAD_OBSERVE_SECONDS="${POST_LOAD_OBSERVE_SECONDS:-120}"
WAIT_SCALE_DOWN="${WAIT_SCALE_DOWN:-true}"
SCALE_DOWN_TIMEOUT="${SCALE_DOWN_TIMEOUT:-420}"
TIMESTAMP="$(date '+%Y%m%d_%H%M%S')"
REPORT_DIR="${REPORT_DIR:-load-test-results/${TIMESTAMP}}"
REPORT_LOG="${REPORT_DIR}/hpa-load-test.log"
SNAPSHOT_LOG="${REPORT_DIR}/hpa-snapshots.log"
WORKER_LOG="${REPORT_DIR}/worker-logs.log"
HPA_DESCRIPTION="${REPORT_DIR}/hpa-description.txt"
PORT_FORWARD_PID=""
MONITOR_PID=""

mkdir -p "$REPORT_DIR"
exec > >(tee -a "$REPORT_LOG") 2>&1

separator(){ printf '\n============================================================\n'; }
title(){ separator; printf '%s\n' "$1"; separator; }

cleanup(){
  local code=$?
  [[ -n "$MONITOR_PID" ]] && kill "$MONITOR_PID" 2>/dev/null || true
  [[ -n "$PORT_FORWARD_PID" ]] && kill "$PORT_FORWARD_PID" 2>/dev/null || true
  echo
  echo "Procesos temporales cerrados."
  echo "Evidencias: $REPORT_DIR"
  exit "$code"
}
trap cleanup EXIT INT TERM

require(){ command -v "$1" >/dev/null 2>&1 || { echo "ERROR: falta $1"; exit 1; }; }

snapshot(){
  {
    echo
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] SNAPSHOT"
    echo "--- HPA ---"
    kubectl get hpa "$HPA_NAME" -n "$NAMESPACE" || true
    echo
    echo "--- PODS ---"
    kubectl get pods -n "$NAMESPACE" -l "$WORKER_LABEL" || true
    echo
    echo "--- CPU / MEMORIA ---"
    kubectl top pods -n "$NAMESPACE" -l "$WORKER_LABEL" || true
  } | tee -a "$SNAPSHOT_LOG"
}

monitor(){
  while true; do snapshot; sleep "$MONITOR_INTERVAL"; done
}

wait_metrics(){
  echo "Esperando métricas del HPA..."
  for i in $(seq 1 30); do
    value="$(kubectl get hpa "$HPA_NAME" -n "$NAMESPACE" -o jsonpath='{.status.currentMetrics[0].resource.current.averageUtilization}' 2>/dev/null || true)"
    if [[ -n "$value" ]]; then
      echo "Métricas disponibles: CPU ${value}%"
      return
    fi
    echo "Intento $i/30..."
    sleep 5
  done
  echo "ERROR: Metrics Server no entregó métricas."
  exit 1
}

wait_port_forward(){
  for _ in $(seq 1 20); do
    if curl -s -o /dev/null --connect-timeout 2 "http://${RABBITMQ_HOST}:${RABBITMQ_PORT}/"; then
      echo "RabbitMQ Management accesible en ${RABBITMQ_HOST}:${RABBITMQ_PORT}"
      return
    fi
    kill -0 "$PORT_FORWARD_PID" 2>/dev/null || { cat "$REPORT_DIR/rabbitmq-port-forward.log"; exit 1; }
    sleep 1
  done
  echo "ERROR: RabbitMQ Management no respondió."
  exit 1
}

wait_scale_down(){
  local start now replicas
  start="$(date +%s)"
  echo "Esperando scale-down a 1 réplica..."
  while true; do
    replicas="$(kubectl get hpa "$HPA_NAME" -n "$NAMESPACE" -o jsonpath='{.status.currentReplicas}' 2>/dev/null || echo 0)"
    now=$(( $(date +%s) - start ))
    echo "[$(date '+%H:%M:%S')] réplicas=$replicas tiempo=${now}s"
    [[ "$replicas" == "1" ]] && { echo "Scale-down confirmado."; return; }
    (( now >= SCALE_DOWN_TIMEOUT )) && { echo "ADVERTENCIA: timeout de scale-down."; return; }
    sleep 10
  done
}

title "PRUEBA DE CARGA DEL RECOMMENDATION WORKER"
echo "Namespace: $NAMESPACE"
echo "Mensajes: $TOTAL_MESSAGES"
echo "Concurrencia: $CONCURRENCY"
echo "Reporte: $REPORT_DIR"

require kubectl
require curl
require bash
require tee
[[ -f "$HPA_FILE" ]] || { echo "ERROR: no existe $HPA_FILE"; exit 1; }
[[ -f "$LOAD_SCRIPT" ]] || { echo "ERROR: no existe $LOAD_SCRIPT"; exit 1; }

title "1. CLÚSTER Y METRICS SERVER"
kubectl cluster-info >/dev/null
kubectl config current-context
kubectl top nodes || { echo "Habilita Metrics Server con: minikube addons enable metrics-server"; exit 1; }

title "2. HPA"
kubectl apply -f "$HPA_FILE"
kubectl get hpa "$HPA_NAME" -n "$NAMESPACE"
kubectl get deployment "$DEPLOYMENT_NAME" -n "$NAMESPACE" -o jsonpath='{.spec.template.spec.containers[0].resources}{"\n"}'
wait_metrics

title "3. ESTADO INICIAL"
snapshot
INITIAL_REPLICAS="$(kubectl get hpa "$HPA_NAME" -n "$NAMESPACE" -o jsonpath='{.status.currentReplicas}')"
echo "Réplicas iniciales: $INITIAL_REPLICAS"

title "4. PORT-FORWARD RABBITMQ"
kubectl port-forward "svc/${RABBITMQ_SERVICE}" -n "$NAMESPACE" "${RABBITMQ_PORT}:15672" >"$REPORT_DIR/rabbitmq-port-forward.log" 2>&1 &
PORT_FORWARD_PID=$!
wait_port_forward

title "5. MONITOREO"
monitor &
MONITOR_PID=$!
sleep 3

title "6. CARGA"
START="$(date +%s)"
env TOTAL_MESSAGES="$TOTAL_MESSAGES" CONCURRENCY="$CONCURRENCY" RABBITMQ_HOST="$RABBITMQ_HOST" RABBITMQ_PORT="$RABBITMQ_PORT" RABBITMQ_USERNAME="$RABBITMQ_USERNAME" RABBITMQ_PASSWORD="$RABBITMQ_PASSWORD" bash "$LOAD_SCRIPT"
DURATION=$(( $(date +%s) - START ))
echo "Carga terminada en ${DURATION}s."

title "7. OBSERVACIÓN POST-CARGA"
sleep "$POST_LOAD_OBSERVE_SECONDS"
kill "$MONITOR_PID" 2>/dev/null || true
wait "$MONITOR_PID" 2>/dev/null || true
MONITOR_PID=""

title "8. LOGS DE WORKERS"
kubectl logs -n "$NAMESPACE" -l "$WORKER_LABEL" --prefix=true --tail=1000 2>&1 | tee "$WORKER_LOG" || true

title "9. EVENTOS DEL HPA"
kubectl describe hpa "$HPA_NAME" -n "$NAMESPACE" | tee "$HPA_DESCRIPTION"
grep -E 'SuccessfulRescale|New size|above target|below target|ScaleUp|ScaleDown' "$HPA_DESCRIPTION" || true

title "10. SCALE-DOWN"
[[ "$WAIT_SCALE_DOWN" == "true" ]] && wait_scale_down || echo "Espera de scale-down deshabilitada."

title "11. RESULTADO FINAL"
snapshot
FINAL_REPLICAS="$(kubectl get hpa "$HPA_NAME" -n "$NAMESPACE" -o jsonpath='{.status.currentReplicas}' 2>/dev/null || echo desconocido)"
echo "Mensajes: $TOTAL_MESSAGES"
echo "Concurrencia: $CONCURRENCY"
echo "Duración: ${DURATION}s"
echo "Réplicas iniciales: $INITIAL_REPLICAS"
echo "Réplicas finales: $FINAL_REPLICAS"
echo "Evidencias en: $REPORT_DIR"
