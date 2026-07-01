# Flujo RabbitMQ: resource completed -> recommendation generated

Este documento describe la parte asincrona implementada para el Integrante 1.

## Flujo implementado

1. El cliente REST llama al API Gateway:
   `POST /api/students/{studentId}/resources/{resourceId}/complete`
2. El API Gateway reenvia la solicitud a `academic-service`.
3. `academic-service` marca el recurso como completado, actualiza progreso y publica:
   - `eventType`: `RESOURCE_COMPLETED`
   - `exchange`: `academic.events.exchange`
   - `routing key`: `academic.resource.completed`
4. `recommendation-worker` consume el mensaje desde `academic.events.queue`.
5. El worker valida el contrato JSON, identifica estudiante/recurso y consulta contexto por REST a `academic-service` cuando hay autorizacion disponible:
   - progreso del estudiante
   - recursos del curso
   - recomendaciones existentes
6. Con ese contexto, el worker recomienda primero un recurso pendiente del mismo curso. Si no puede consultar contexto, usa la logica local existente por titulo del recurso completado.
7. El worker publica el resultado para el notificador/WebSocket:
   - `eventType`: `RECOMMENDATION_GENERATED`
   - `exchange`: `academic.notifications.exchange`
   - `routing key`: `academic.recommendation.generated`

Se usa un exchange de notificaciones separado para desacoplar los eventos internos de dominio (`academic.events.exchange`) de los eventos que deben disparar notificaciones en tiempo real. Asi el Integrante 2 puede enlazar su propia cola sin tocar la cola consumida por el worker.

## Contrato de entrada: RESOURCE_COMPLETED

Exchange: `academic.events.exchange`

Routing key: `academic.resource.completed`

Productor: `academic-service`

Consumidor: `recommendation-worker`

```json
{
  "eventType": "RESOURCE_COMPLETED",
  "studentId": 1,
  "subjectId": 1,
  "courseId": 1,
  "resourceId": 1,
  "resourceTitle": "Introduccion a Docker",
  "completedAt": "2026-07-01T01:20:30.123456"
}
```

Campos:

- `eventType`: debe ser `RESOURCE_COMPLETED`.
- `studentId`: identificador del estudiante.
- `subjectId`: identificador de la materia.
- `courseId`: identificador del curso.
- `resourceId`: identificador del recurso completado.
- `resourceTitle`: titulo del recurso completado.
- `completedAt`: fecha/hora ISO-8601 generada por `academic-service`.

## Contrato de salida: RECOMMENDATION_GENERATED

Exchange: `academic.notifications.exchange`

Routing key: `academic.recommendation.generated`

Productor: `recommendation-worker`

Consumidor esperado: notificador/WebSocket del Integrante 2.

```json
{
  "eventId": "85f1c9ce-62a7-48ec-9f33-b3591692d5a9",
  "eventType": "RECOMMENDATION_GENERATED",
  "studentId": 1,
  "status": "GENERATED",
  "message": "Recomendación generada: Recurso recomendado: RabbitMQ para principiantes",
  "timestamp": "2026-07-01T06:20:30.456789Z",
  "subjectId": 1,
  "courseId": 1,
  "resourceId": 1,
  "resourceTitle": "Introduccion a Docker",
  "completedAt": "2026-07-01T01:20:30.123456",
  "generatedAt": "2026-07-01T06:20:30.456789Z",
  "sourceEventType": "RESOURCE_COMPLETED",
  "recommendation": {
    "title": "Recurso recomendado: RabbitMQ para principiantes",
    "reason": "Completaste 'Introduccion a Docker'. El siguiente recurso pendiente del mismo curso te ayuda a continuar: Material introductorio sobre colas de mensajeria."
  }
}
```

Campos:

- `eventId`: UUID generado por el worker para trazabilidad.
- `eventType`: siempre `RECOMMENDATION_GENERATED`.
- `status`, `message`, `timestamp`: campos simples compatibles con el hook frontend existente que escucha `recommendation-generated`.
- `studentId`, `subjectId`, `courseId`, `resourceId`, `resourceTitle`, `completedAt`: datos heredados del evento de entrada.
- `generatedAt`: fecha/hora ISO-8601 en UTC en la que el worker genero la recomendacion.
- `sourceEventType`: indica que el resultado viene de `RESOURCE_COMPLETED`.
- `recommendation.title`: titulo de la recomendacion generada.
- `recommendation.reason`: razon explicativa para mostrar/notificar.

## Variables de entorno

Entrada desde `academic-service`:

```env
ACADEMIC_EVENTS_EXCHANGE=academic.events.exchange
ACADEMIC_EVENTS_QUEUE=academic.events.queue
ACADEMIC_RESOURCE_COMPLETED_ROUTING_KEY=academic.resource.completed
```

Salida del `recommendation-worker`:

```env
ACADEMIC_NOTIFICATIONS_EXCHANGE=academic.notifications.exchange
ACADEMIC_RECOMMENDATION_GENERATED_ROUTING_KEY=academic.recommendation.generated
RECOMMENDATION_WORKER_REQUEUE_ON_FAILURE=false
ACADEMIC_SERVICE_URL=http://academic-service:8080
RECOMMENDATION_WORKER_ACADEMIC_SERVICE_TOKEN=
RECOMMENDATION_WORKER_ACADEMIC_SERVICE_TIMEOUT_SECONDS=2
```

`RECOMMENDATION_WORKER_REQUEUE_ON_FAILURE=false` evita ciclos infinitos ante errores inesperados. Para pruebas controladas puede cambiarse a `true`, pero en demo se recomienda mantenerlo en `false`.

`RECOMMENDATION_WORKER_ACADEMIC_SERVICE_TOKEN` es opcional. Si `academic-service` exige JWT y no se pasa token, el worker registra un warning y continua con recomendacion local por titulo para no romper el procesamiento asincrono.

## Manejo de errores del worker

- JSON invalido, contrato invalido o `eventType` no soportado: log de error y `basic_ack` para descartar el mensaje.
- Procesamiento correcto: `basic_ack`.
- Error temporal al publicar el evento de resultado: `basic_nack` con requeue solo en el primer intento; si RabbitMQ redelivera el mensaje, se descarta para evitar requeue infinito.
- Error inesperado no clasificado: `basic_nack` con `requeue` controlado por `RECOMMENDATION_WORKER_REQUEUE_ON_FAILURE`.

## Comandos de prueba

```bash
docker compose up --build -d
docker compose logs -f academic-service
docker compose logs -f recommendation-worker
curl -X POST http://localhost:3000/api/students/1/resources/1/complete
docker compose exec rabbitmq rabbitmqctl list_queues name messages consumers
docker compose exec rabbitmq rabbitmqctl list_exchanges
docker compose exec rabbitmq rabbitmqctl list_bindings
```

Para publicar un evento manual sin pasar por REST:

```bash
bash scripts/publish-test-event.sh
```

## Para Integrante 2

En el repo ya existe Socket.IO inicializado en `web-gateway-service` y el frontend escucha el evento `recommendation-generated`. No se modifico esa implementacion.

Para recibir el evento RabbitMQ, el notificador debe declarar una cola propia, por ejemplo `academic.notifications.queue`, y enlazarla asi:

- exchange: `academic.notifications.exchange`
- exchange type: `topic`
- routing key: `academic.recommendation.generated`

No debe consumir `academic.events.queue`, porque esa cola pertenece al worker.

Al emitir por Socket.IO, el nombre observado en frontend es `recommendation-generated`. El payload minimo compatible es:

```json
{
  "studentId": 1,
  "status": "GENERATED",
  "message": "Recomendación generada: Recurso recomendado: RabbitMQ para principiantes",
  "timestamp": "2026-07-01T06:20:30.456789Z"
}
```

## Para Integrante 3

En Kubernetes deben pasarse estas variables al deployment del worker:

- `RABBITMQ_HOST`
- `RABBITMQ_PORT`
- `RABBITMQ_USERNAME`
- `RABBITMQ_PASSWORD`
- `ACADEMIC_EVENTS_EXCHANGE`
- `ACADEMIC_EVENTS_QUEUE`
- `ACADEMIC_RESOURCE_COMPLETED_ROUTING_KEY`
- `ACADEMIC_NOTIFICATIONS_EXCHANGE`
- `ACADEMIC_RECOMMENDATION_GENERATED_ROUTING_KEY`
- `RECOMMENDATION_WORKER_REQUEUE_ON_FAILURE`
- `ACADEMIC_SERVICE_URL`
- `RECOMMENDATION_WORKER_ACADEMIC_SERVICE_TOKEN`
- `RECOMMENDATION_WORKER_ACADEMIC_SERVICE_TIMEOUT_SECONDS`

`academic-service` necesita las variables de RabbitMQ de entrada para publicar `RESOURCE_COMPLETED`. El worker necesita tanto las variables de entrada como las de salida.
