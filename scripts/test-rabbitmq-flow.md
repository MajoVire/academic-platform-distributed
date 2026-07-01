# Prueba manual del flujo RabbitMQ

## 1. Levantar el entorno

```bash
docker compose up --build -d
```

## 2. Ver logs del producer

```bash
docker compose logs -f academic-service
```

Debe aparecer un log parecido a:

```text
Publishing RESOURCE_COMPLETED for student 1 resource 1 to exchange academic.events.exchange with routing key academic.resource.completed
Published RESOURCE_COMPLETED for student 1 resource 1 to exchange academic.events.exchange with routing key academic.resource.completed
```

## 3. Ver logs del worker

```bash
docker compose logs -f recommendation-worker
```

Debe aparecer una secuencia parecida a:

```text
Evento recibido: RESOURCE_COMPLETED
Estudiante: 1
Recurso completado: Introduccion a Docker (1)
Datos consultados para recomendación: progress=...
Recomendación generada para estudiante 1: title='...'
Evento de resultado publicado: eventType=RECOMMENDATION_GENERATED
Mensaje confirmado con ack
```

## 4. Disparar el flujo desde REST

```bash
curl -X POST http://localhost:3000/api/students/1/resources/1/complete
```

## 5. Inspeccionar RabbitMQ

```bash
docker compose exec rabbitmq rabbitmqctl list_queues name messages consumers
docker compose exec rabbitmq rabbitmqctl list_exchanges
docker compose exec rabbitmq rabbitmqctl list_bindings
```

Debe existir:

- exchange `academic.events.exchange`
- cola `academic.events.queue`
- binding `academic.events.exchange -> academic.events.queue` con routing key `academic.resource.completed`
- exchange `academic.notifications.exchange`

El repo ya tiene Socket.IO inicializado y el frontend escucha `recommendation-generated`. Si el consumidor RabbitMQ del notificador aun no declara su cola, `academic.notifications.exchange` puede aparecer sin bindings adicionales.

## 6. Probar solo el worker

Si quieres probar el worker sin pasar por el endpoint REST:

```bash
bash scripts/publish-test-event.sh
```

Este comando publica un `RESOURCE_COMPLETED` usando la API HTTP de RabbitMQ Management.
