#!/usr/bin/env bash
set -Eeuo pipefail

# Academic Platform - Demo HTTPS con una sola URL pública.
#
# Uso desde Fish:
#   ./scripts/deploy-https-one-tunnel.sh https
#   ./scripts/deploy-https-one-tunnel.sh local
#   ./scripts/deploy-https-one-tunnel.sh stop
#
# La URL de Cloudflare se descubre automáticamente en cada ejecución.
# No hay dominios hardcodeados.

NAMESPACE="${NAMESPACE:-academic-platform}"
REALM="${REALM:-academic-platform}"
CLIENT_ID="${CLIENT_ID:-academic-frontend}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STATE_DIR="$ROOT/.demo/one-tunnel"
LOG_DIR="$STATE_DIR/logs"
PID_FILE="$STATE_DIR/pids.env"
URL_FILE="$STATE_DIR/https-urls.env"
FRONTEND_ENV="$ROOT/frontend/.env.production.local"
ENV_BACKUP="$STATE_DIR/.env.production.local.backup"

PROXY_DEPLOYMENT="https-demo-proxy"
PROXY_SERVICE="https-demo-proxy"

mkdir -p "$LOG_DIR"

info() { printf '\033[36m[INFO]\033[0m %s\n' "$*"; }
ok()   { printf '\033[32m[OK]\033[0m %s\n' "$*"; }
warn() { printf '\033[33m[AVISO]\033[0m %s\n' "$*"; }
die()  { printf '\033[31m[ERROR]\033[0m %s\n' "$*" >&2; exit 1; }

need() {
  command -v "$1" >/dev/null 2>&1 || die "Falta el comando: $1"
}

wait_url() {
  local url="$1"
  local name="$2"

  for _ in $(seq 1 75); do
    if curl -fsS --max-time 4 "$url" >/dev/null 2>&1; then
      ok "$name responde: $url"
      return 0
    fi
    sleep 2
  done

  die "$name no respondió: $url"
}

stop_saved_processes() {
  if [[ -f "$PID_FILE" ]]; then
    while IFS='=' read -r _name pid; do
      [[ "$pid" =~ ^[0-9]+$ ]] || continue
      kill "$pid" >/dev/null 2>&1 || true
    done < "$PID_FILE"
    rm -f "$PID_FILE"
  fi

  # Limpia procesos dejados por los scripts anteriores de esta demo.
  pkill -f 'kubectl port-forward service/https-demo-proxy' >/dev/null 2>&1 || true
  pkill -f 'cloudflared tunnel.*127.0.0.1:18' >/dev/null 2>&1 || true
  sleep 1
}

find_free_port() {
  local port
  for port in $(seq 18088 18120); do
    if ! ss -ltn 2>/dev/null | awk '{print $4}' | grep -Eq "[:.]${port}$"; then
      printf '%s\n' "$port"
      return 0
    fi
  done

  die "No encontré un puerto libre entre 18088 y 18120"
}

start_proxy_port_forward() {
  local port="$1"

  nohup kubectl port-forward "service/$PROXY_SERVICE" \
    -n "$NAMESPACE" \
    "$port:8080" \
    >"$LOG_DIR/proxy-port-forward.log" 2>&1 &

  printf '%s\n' "$!"
}

start_local_port_forward() {
  local service="$1"
  local mapping="$2"
  local log_name="$3"

  nohup kubectl port-forward "service/$service" \
    -n "$NAMESPACE" \
    "$mapping" \
    >"$LOG_DIR/$log_name.log" 2>&1 &

  printf '%s\n' "$!"
}

start_cloudflared() {
  local port="$1"

  nohup cloudflared tunnel --no-autoupdate \
    --url "http://127.0.0.1:$port" \
    >"$LOG_DIR/cloudflared.log" 2>&1 &

  printf '%s\n' "$!"
}

read_public_url() {
  for _ in $(seq 1 75); do
    local url
    url="$(grep -Eo 'https://[a-z0-9-]+\.trycloudflare\.com' \
      "$LOG_DIR/cloudflared.log" 2>/dev/null | head -n 1 || true)"

    if [[ -n "$url" ]]; then
      printf '%s\n' "$url"
      return 0
    fi

    sleep 2
  done

  die "No se obtuvo la URL de Cloudflare. Revisa $LOG_DIR/cloudflared.log"
}

apply_proxy() {
  info "Aplicando Nginx reverse proxy en Kubernetes"

  cat <<EOF | kubectl apply -n "$NAMESPACE" -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: $PROXY_SERVICE
data:
  nginx.conf: |
    events {}

    http {
      map \$http_upgrade \$connection_upgrade {
        default upgrade;
        '' close;
      }

      server {
        listen 8080;

        location = /tunnel-health {
          default_type text/plain;
          return 200 "proxy-up";
        }

        location /api/ {
          proxy_pass http://web-gateway-service:3000;
          proxy_http_version 1.1;
          proxy_set_header Host \$host;
          proxy_set_header X-Forwarded-Host \$host;
          proxy_set_header X-Forwarded-Proto https;
          proxy_set_header X-Forwarded-Port 443;
          proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        }

        location /socket.io/ {
          proxy_pass http://web-gateway-service:3000;
          proxy_http_version 1.1;
          proxy_set_header Upgrade \$http_upgrade;
          proxy_set_header Connection \$connection_upgrade;
          proxy_set_header Host \$host;
          proxy_set_header X-Forwarded-Host \$host;
          proxy_set_header X-Forwarded-Proto https;
          proxy_set_header X-Forwarded-Port 443;
          proxy_read_timeout 3600;
          proxy_send_timeout 3600;
        }

        location /realms/ {
          proxy_pass http://keycloak:8080;
          proxy_http_version 1.1;
          proxy_set_header Host \$host;
          proxy_set_header X-Forwarded-Host \$host;
          proxy_set_header X-Forwarded-Proto https;
          proxy_set_header X-Forwarded-Port 443;
          proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        }

        location /resources/ {
          proxy_pass http://keycloak:8080;
          proxy_http_version 1.1;
          proxy_set_header Host \$host;
          proxy_set_header X-Forwarded-Host \$host;
          proxy_set_header X-Forwarded-Proto https;
          proxy_set_header X-Forwarded-Port 443;
          proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        }

        location /admin/ {
          proxy_pass http://keycloak:8080;
          proxy_http_version 1.1;
          proxy_set_header Host \$host;
          proxy_set_header X-Forwarded-Host \$host;
          proxy_set_header X-Forwarded-Proto https;
          proxy_set_header X-Forwarded-Port 443;
          proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        }

        location / {
          proxy_pass http://frontend:5173;
          proxy_http_version 1.1;
          proxy_set_header Host \$host;
          proxy_set_header X-Forwarded-Host \$host;
          proxy_set_header X-Forwarded-Proto https;
          proxy_set_header X-Forwarded-Port 443;
          proxy_set_header Upgrade \$http_upgrade;
          proxy_set_header Connection \$connection_upgrade;
        }
      }
    }
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: $PROXY_DEPLOYMENT
spec:
  replicas: 1
  selector:
    matchLabels:
      app.kubernetes.io/name: $PROXY_DEPLOYMENT
  template:
    metadata:
      labels:
        app.kubernetes.io/name: $PROXY_DEPLOYMENT
    spec:
      containers:
        - name: nginx
          image: nginx:1.27-alpine
          ports:
            - name: http
              containerPort: 8080
          volumeMounts:
            - name: nginx-config
              mountPath: /etc/nginx/nginx.conf
              subPath: nginx.conf
          readinessProbe:
            httpGet:
              path: /tunnel-health
              port: 8080
            initialDelaySeconds: 2
            periodSeconds: 3
          livenessProbe:
            httpGet:
              path: /tunnel-health
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
          resources:
            requests:
              cpu: 10m
              memory: 16Mi
            limits:
              cpu: 100m
              memory: 64Mi
      volumes:
        - name: nginx-config
          configMap:
            name: $PROXY_SERVICE
---
apiVersion: v1
kind: Service
metadata:
  name: $PROXY_SERVICE
spec:
  type: ClusterIP
  selector:
    app.kubernetes.io/name: $PROXY_DEPLOYMENT
  ports:
    - name: http
      port: 8080
      targetPort: 8080
EOF

  kubectl rollout restart "deployment/$PROXY_DEPLOYMENT" -n "$NAMESPACE" >/dev/null
  kubectl rollout status "deployment/$PROXY_DEPLOYMENT" \
    -n "$NAMESPACE" \
    --timeout=180s
}

keycloak_admin_login() {
  local kc_admin kc_password

  kc_admin="$(kubectl exec deployment/keycloak -n "$NAMESPACE" -- \
    printenv KEYCLOAK_ADMIN 2>/dev/null | tr -d '\r' | xargs)"

  kc_password="$(kubectl exec deployment/keycloak -n "$NAMESPACE" -- \
    printenv KEYCLOAK_ADMIN_PASSWORD 2>/dev/null | tr -d '\r' | xargs)"

  [[ -n "$kc_admin" ]] || die "No existe KEYCLOAK_ADMIN en el pod"
  [[ -n "$kc_password" ]] || die "No existe KEYCLOAK_ADMIN_PASSWORD en el pod"

  kubectl exec deployment/keycloak -n "$NAMESPACE" -- \
    /opt/keycloak/bin/kcadm.sh config credentials \
      --server http://localhost:8080 \
      --realm master \
      --user "$kc_admin" \
      --password "$kc_password" \
      >/dev/null
}

configure_keycloak_client() {
  local frontend_url="$1"

  info "Actualizando cliente $CLIENT_ID en Keycloak"
  keycloak_admin_login

  local client_uuid
  client_uuid="$(kubectl exec deployment/keycloak -n "$NAMESPACE" -- \
    /opt/keycloak/bin/kcadm.sh get clients \
      -r "$REALM" \
      -q "clientId=$CLIENT_ID" \
      --fields id \
      --format csv \
      --noquotes 2>/dev/null \
      | head -n 1 | tr -d '\r' | xargs)"

  [[ -n "$client_uuid" ]] || die "No se encontró el cliente $CLIENT_ID"

  kubectl exec deployment/keycloak -n "$NAMESPACE" -- \
    /opt/keycloak/bin/kcadm.sh update "clients/$client_uuid" \
      -r "$REALM" \
      -s "rootUrl=$frontend_url" \
      -s "baseUrl=$frontend_url" \
      -s "redirectUris=[\"$frontend_url/*\"]" \
      -s "webOrigins=[\"$frontend_url\"]" \
      -s "attributes.\"post.logout.redirect.uris\"=\"$frontend_url/*\"" \
      >/dev/null

  ok "Redirect URIs y Web Origins actualizados"
}

backup_env() {
  if [[ -f "$FRONTEND_ENV" ]]; then
    cp "$FRONTEND_ENV" "$ENV_BACKUP"
  else
    rm -f "$ENV_BACKUP"
  fi
}

restore_env() {
  if [[ -f "$ENV_BACKUP" ]]; then
    cp "$ENV_BACKUP" "$FRONTEND_ENV"
  else
    rm -f "$FRONTEND_ENV"
  fi
}

build_frontend_https() {
  local public_url="$1"
  local sha tag image container

  sha="$(git -C "$ROOT" rev-parse --short HEAD)"
  tag="https-${sha}-$(date +%Y%m%d%H%M%S)"
  image="academic-platform/frontend:$tag"

  backup_env

  cat >"$FRONTEND_ENV" <<EOF
VITE_API_BASE_URL=$public_url/api
VITE_GATEWAY_URL=$public_url
VITE_KEYCLOAK_URL=$public_url
VITE_KEYCLOAK_REALM=$REALM
VITE_KEYCLOAK_CLIENT_ID=$CLIENT_ID
EOF

  info "Construyendo frontend con URL dinámica: $public_url"
  eval "$(minikube docker-env)"
  docker build --no-cache -t "$image" "$ROOT/frontend"

  restore_env

  container="$(kubectl get deployment frontend \
    -n "$NAMESPACE" \
    -o jsonpath='{.spec.template.spec.containers[0].name}')"

  kubectl set image deployment/frontend \
    "$container=$image" \
    -n "$NAMESPACE" \
    >/dev/null

  kubectl rollout status deployment/frontend \
    -n "$NAMESPACE" \
    --timeout=300s

  printf '%s\n' "$image"
}

build_frontend_local() {
  local sha tag image container

  sha="$(git -C "$ROOT" rev-parse --short HEAD)"
  tag="local-${sha}-$(date +%Y%m%d%H%M%S)"
  image="academic-platform/frontend:$tag"

  backup_env

  cat >"$FRONTEND_ENV" <<EOF
VITE_API_BASE_URL=http://localhost:3000/api
VITE_GATEWAY_URL=http://localhost:3000
VITE_KEYCLOAK_URL=http://localhost:8180
VITE_KEYCLOAK_REALM=$REALM
VITE_KEYCLOAK_CLIENT_ID=$CLIENT_ID
EOF

  info "Construyendo frontend local"
  eval "$(minikube docker-env)"
  docker build --no-cache -t "$image" "$ROOT/frontend"

  restore_env

  container="$(kubectl get deployment frontend \
    -n "$NAMESPACE" \
    -o jsonpath='{.spec.template.spec.containers[0].name}')"

  kubectl set image deployment/frontend \
    "$container=$image" \
    -n "$NAMESPACE" \
    >/dev/null

  kubectl rollout status deployment/frontend \
    -n "$NAMESPACE" \
    --timeout=300s
}

https_mode() {
  stop_saved_processes
  apply_proxy

  local proxy_port pf_pid cf_pid public_url frontend_image

  proxy_port="$(find_free_port)"
  info "Usando puerto local dinámico: $proxy_port"

  pf_pid="$(start_proxy_port_forward "$proxy_port")"
  wait_url "http://127.0.0.1:$proxy_port/tunnel-health" "Proxy local"

  cf_pid="$(start_cloudflared "$proxy_port")"
  public_url="$(read_public_url)"

  [[ "$public_url" =~ ^https://[a-z0-9-]+\.trycloudflare\.com$ ]] \
    || die "Cloudflare devolvió una URL inválida: $public_url"

  ok "URL pública detectada automáticamente: $public_url"

  # Configura el cliente antes del reinicio de Keycloak.
  configure_keycloak_client "$public_url"

  info "Configurando Keycloak sin ruta relativa"
  kubectl set env deployment/keycloak \
    -n "$NAMESPACE" \
    "KC_HOSTNAME=$public_url" \
    "KC_PROXY_HEADERS=xforwarded" \
    "KC_HTTP_ENABLED=true" \
    KC_HTTP_RELATIVE_PATH=/ \
    >/dev/null

  kubectl rollout status deployment/keycloak \
    -n "$NAMESPACE" \
    --timeout=300s

  info "Configurando CORS del gateway"
  kubectl set env deployment/web-gateway-service \
    -n "$NAMESPACE" \
    "GATEWAY_CORS_ORIGIN=$public_url" \
    >/dev/null

  kubectl rollout status deployment/web-gateway-service \
    -n "$NAMESPACE" \
    --timeout=300s

  frontend_image="$(build_frontend_https "$public_url")"

  printf '%s\n' \
    "PROXY_PORT_FORWARD_PID=$pf_pid" \
    "CLOUDFLARED_PID=$cf_pid" \
    >"$PID_FILE"

  printf '%s\n' \
    "PUBLIC_URL=$public_url" \
    "PUBLIC_FRONTEND_URL=$public_url" \
    "PUBLIC_GATEWAY_URL=$public_url" \
    "PUBLIC_KEYCLOAK_URL=$public_url" \
    "VITE_API_BASE_URL=$public_url/api" \
    "VITE_GATEWAY_URL=$public_url" \
    "VITE_KEYCLOAK_URL=$public_url" \
    "FRONTEND_IMAGE=$frontend_image" \
    >"$URL_FILE"

  wait_url "$public_url/tunnel-health" "Proxy público"
  wait_url "$public_url/realms/$REALM/.well-known/openid-configuration" "Keycloak público"
  wait_url "$public_url" "Frontend público"

  local issuer
  issuer="$(curl -fsS "$public_url/realms/$REALM/.well-known/openid-configuration" \
    | grep -o '"issuer":"[^"]*"' | head -n1 || true)"

  echo
  printf '\033[32m════════════ DEMO HTTPS LISTA ════════════\033[0m\n'
  printf 'Aplicación: %s\n' "$public_url"
  printf 'API:        %s/api\n' "$public_url"
  printf 'Keycloak:   %s/realms/%s\n' "$public_url" "$REALM"
  printf 'Issuer:     %s\n' "$issuer"
  printf 'URLs:       %s\n' "$URL_FILE"
  printf 'Logs:       %s\n' "$LOG_DIR"
  printf '\nENTRA SOLO POR: %s\n' "$public_url"
}

local_mode() {
  stop_saved_processes

  info "Restaurando Keycloak local"
  kubectl set env deployment/keycloak \
    -n "$NAMESPACE" \
    "KC_HOSTNAME=http://localhost:8180" \
    "KC_HTTP_ENABLED=true" \
    KC_HTTP_RELATIVE_PATH=/ \
    KC_PROXY_HEADERS- \
    >/dev/null

  kubectl rollout status deployment/keycloak \
    -n "$NAMESPACE" \
    --timeout=300s

  configure_keycloak_client "http://localhost:5173"

  info "Restaurando CORS local"
  kubectl set env deployment/web-gateway-service \
    -n "$NAMESPACE" \
    "GATEWAY_CORS_ORIGIN=http://localhost:5173" \
    >/dev/null

  kubectl rollout status deployment/web-gateway-service \
    -n "$NAMESPACE" \
    --timeout=300s

  build_frontend_local

  local pf_front pf_api pf_kc

  pf_front="$(start_local_port_forward frontend "5173:5173" "frontend-local")"
  pf_api="$(start_local_port_forward web-gateway-service "3000:3000" "gateway-local")"
  pf_kc="$(start_local_port_forward keycloak "8180:8080" "keycloak-local")"

  printf '%s\n' \
    "FRONTEND_PORT_FORWARD_PID=$pf_front" \
    "GATEWAY_PORT_FORWARD_PID=$pf_api" \
    "KEYCLOAK_PORT_FORWARD_PID=$pf_kc" \
    >"$PID_FILE"

  wait_url "http://localhost:5173" "Frontend local"
  wait_url "http://localhost:3000/health" "Gateway local"
  wait_url "http://localhost:8180/realms/$REALM/.well-known/openid-configuration" "Keycloak local"

  echo
  printf '\033[32m════════════ MODO LOCAL LISTO ════════════\033[0m\n'
  printf 'Frontend: http://localhost:5173\n'
  printf 'Gateway:  http://localhost:3000\n'
  printf 'Keycloak: http://localhost:8180\n'
}

stop_mode() {
  stop_saved_processes
  ok "Túnel y port-forward detenidos"
}

main() {
  cd "$ROOT"

  for command_name in kubectl minikube docker cloudflared curl git ss; do
    need "$command_name"
  done

  minikube status >/dev/null || die "Minikube no está iniciado"
  kubectl get namespace "$NAMESPACE" >/dev/null 2>&1 \
    || die "No existe el namespace $NAMESPACE"

  case "${1:-https}" in
    https) https_mode ;;
    local) local_mode ;;
    stop) stop_mode ;;
    *) die "Uso: $0 {https|local|stop}" ;;
  esac
}

main "$@"
