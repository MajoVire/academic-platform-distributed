# Kubernetes Scaling and Load Test

## Objetivo

Validar el escalado automático de `recommendation-worker` con un HPA basado en CPU y demostrar que el worker procesa eventos `RESOURCE_COMPLETED` bajo carga.

## Configuración del HPA

- Recurso: `k8s/recommendation-worker-hpa.yaml`
- Deployment objetivo: `recommendation-worker`
- `minReplicas`: `1`
- `maxReplicas`: `4`
- Target CPU: `50%`
- Métrica: CPU sobre `requests.cpu`

El worker usa:

- `requests.cpu: 50m`
- `limits.cpu: 500m`

## Metrics Server

El HPA depende de `metrics-server`. En Minikube debe estar habilitado:

```bash
minikube addons enable metrics-server
kubectl top nodes
kubectl top pods -n academic-platform
```

## Script de carga

Archivo:

```text
scripts/load-test-recommendation-worker.sh
```

El script:

- publica eventos `RESOURCE_COMPLETED` contra RabbitMQ Management;
- permite configurar `RABBITMQ_HOST`;
- permite configurar `RABBITMQ_PORT`;
- permite configurar `RABBITMQ_USERNAME`;
- permite configurar `RABBITMQ_PASSWORD`;
- permite configurar la cantidad de eventos con `TOTAL_MESSAGES`;
- elimina el pod temporal al finalizar cuando se ejecuta con `kubectl run --rm`.

Valores por defecto:

- Kubernetes: `RABBITMQ_USERNAME=academic_platform_rabbitmq`
- Docker Compose: `RABBITMQ_USERNAME=guest`

## Ejecución en Kubernetes

Exponer RabbitMQ Management:

```bash
kubectl port-forward svc/rabbitmq 15672:15672 -n academic-platform
```

Ejecutar la carga:

```bash
TOTAL_MESSAGES=1000 CONCURRENCY=8 bash scripts/load-test-recommendation-worker.sh
```

## Ejecución en Docker Compose

```bash
RABBITMQ_USERNAME=guest RABBITMQ_PASSWORD=change_this_rabbitmq_password \
  TOTAL_MESSAGES=1000 CONCURRENCY=8 \
  bash scripts/load-test-recommendation-worker.sh
```

## Resultado real obtenido

Durante la validación se obtuvo:

- `1000` eventos `RESOURCE_COMPLETED`
- `1` réplica inicial
- `3` réplicas máximas
- `106%/50%` de CPU en el pico observado
- scale-down posterior hasta `1` réplica
- logs reales en más de un pod consumidor

## Observación de CPU y réplicas

Comandos útiles:

```bash
kubectl get hpa recommendation-worker -n academic-platform
kubectl describe hpa recommendation-worker -n academic-platform
kubectl get pods -n academic-platform -l app.kubernetes.io/name=recommendation-worker
kubectl top pods -n academic-platform -l app.kubernetes.io/name=recommendation-worker
```

Para observar el scale-up y el scale-down:

```bash
kubectl get hpa recommendation-worker -n academic-platform -w
kubectl get pods -n academic-platform -l app.kubernetes.io/name=recommendation-worker -w
```

## Logs de varios workers

```bash
kubectl logs -l app.kubernetes.io/name=recommendation-worker -n academic-platform --prefix=true --tail=500
```

La evidencia obtenida mostró procesamiento en al menos dos pods distintos del worker durante la carga.

## Limitaciones

- El HPA actual usa CPU, por lo que depende de la relación entre carga y `requests.cpu`.
- La carga via RabbitMQ Management es útil para demo, pero no sustituye un medidor de longitud de cola.
- Para una evolución futura, KEDA permitiría escalar por profundidad de cola sin depender tanto de CPU.

## Alternativa futura

Como mejora futura, podría evaluarse KEDA para escalar `recommendation-worker` por longitud de cola RabbitMQ. Esa alternativa no está implementada en este repositorio.
