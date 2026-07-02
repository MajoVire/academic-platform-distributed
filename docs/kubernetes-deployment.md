# Kubernetes Deployment

## Prerrequisitos

- Docker instalado.
- `kubectl` configurado.
- Minikube en funcionamiento.
- `metrics-server` habilitado en Minikube.

Verificación rápida:

```bash
minikube status
kubectl get nodes
kubectl top nodes
```

## Construcción de imágenes

Las imágenes se construyen localmente y luego se cargan al clúster de Minikube.

```bash
docker build -t academic-platform/academic-service:1.0.2 academic-service
docker build -t academic-platform/recommendation-service:1.0.0 recommendation-service
docker build -t academic-platform/recommendation-worker:1.0.0 -f recommendation-worker/Dockerfile .
docker build -t academic-platform/web-gateway-service:1.0.0 web-gateway-service
docker build -t academic-platform/frontend:1.0.0 frontend
```

Carga en Minikube:

```bash
minikube image load academic-platform/academic-service:1.0.2
minikube image load academic-platform/recommendation-service:1.0.0
minikube image load academic-platform/recommendation-worker:1.0.0
minikube image load academic-platform/web-gateway-service:1.0.0
minikube image load academic-platform/frontend:1.0.0
```

## Orden de aplicación

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/postgres-pvc.yaml
kubectl apply -f k8s/rabbitmq-pvc.yaml
kubectl apply -f k8s/postgres-init-configmap.yaml
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/postgres-service.yaml
kubectl apply -f k8s/rabbitmq-deployment.yaml
kubectl apply -f k8s/rabbitmq-service.yaml
kubectl apply -f k8s/keycloak-realm-configmap.yaml
kubectl apply -f k8s/keycloak-theme-configmap.yaml
kubectl apply -f k8s/keycloak-deployment.yaml
kubectl apply -f k8s/keycloak-service.yaml
kubectl apply -f k8s/recommendation-service-deployment.yaml
kubectl apply -f k8s/recommendation-service-service.yaml
kubectl apply -f k8s/academic-service-deployment.yaml
kubectl apply -f k8s/academic-service-service.yaml
kubectl apply -f k8s/recommendation-worker-deployment.yaml
kubectl apply -f k8s/recommendation-worker-hpa.yaml
kubectl apply -f k8s/web-gateway-deployment.yaml
kubectl apply -f k8s/web-gateway-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
```

## Verificación

```bash
kubectl get pods -n academic-platform
kubectl get svc -n academic-platform
kubectl get deploy -n academic-platform
kubectl get pvc -n academic-platform
kubectl get hpa -n academic-platform
kubectl top pods -n academic-platform
```

## Port-forward

Frontend:

```bash
kubectl port-forward svc/frontend 5173:5173 -n academic-platform
```

Gateway:

```bash
kubectl port-forward svc/web-gateway-service 3000:3000 -n academic-platform
```

Keycloak:

```bash
kubectl port-forward svc/keycloak 8180:8080 -n academic-platform
```

RabbitMQ Management:

```bash
kubectl port-forward svc/rabbitmq 15672:15672 -n academic-platform
```

## Accesos

- Frontend: `http://localhost:5173`
- Gateway: `http://localhost:3000`
- Keycloak: `http://localhost:8180`
- RabbitMQ Management: `http://localhost:15672`

## Persistencia

- PostgreSQL usa `postgres-pvc`.
- RabbitMQ usa `rabbitmq-pvc`.
- Keycloak usa el volumen persistente definido en su Deployment.

## Limpieza

```bash
kubectl delete -f k8s/
```

O elimina todo el namespace:

```bash
kubectl delete namespace academic-platform
```
