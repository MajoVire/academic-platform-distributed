# Academic Platform Distributed

Plataforma académica distribuida para la materia de Sistemas Distribuidos.

## Despliegue

La guía reproducible para Kubernetes está en:

- [Kubernetes Deployment](docs/kubernetes-deployment.md)
- [Kubernetes Scaling and Load Test](docs/kubernetes-scaling-and-load-test.md)
- [Flujo RabbitMQ](docs/rabbitmq-flow.md)

## Resumen

- `academic-service` expone el catálogo, el progreso y la publicación de eventos.
- `recommendation-worker` consume `RESOURCE_COMPLETED` y publica `RECOMMENDATION_GENERATED`.
- `web-gateway-service` centraliza el acceso HTTP y Socket.IO.
- `frontend` consume el gateway y recibe notificaciones en tiempo real.

## Validación

Para una verificación rápida en Minikube:

```bash
kubectl get pods -n academic-platform
kubectl get svc -n academic-platform
kubectl get deploy -n academic-platform
kubectl get hpa -n academic-platform
kubectl top pods -n academic-platform
```

## Notas

- Kubernetes usa `academic_platform_rabbitmq` como usuario del broker.
- Docker Compose usa `guest` por compatibilidad local.
- El HPA de `recommendation-worker` requiere `metrics-server`.
