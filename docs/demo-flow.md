# Flujo Principal del Sistema

## Descripción general

El sistema implementa un flujo distribuido basado en microservicios, comunicación REST y comunicación mediante colas usando RabbitMQ.

El objetivo principal es demostrar cómo múltiples tecnologías pueden trabajar juntas dentro de una arquitectura distribuida.

---

# Flujo distribuido principal

```text
1. Estudiante completa recurso
2. Frontend envía la acción al web-gateway-service
3. web-gateway-service reenvía la solicitud a academic-service
4. Java persiste progreso en PostgreSQL
5. Java registra actividad académica en PostgreSQL
6. Java publica evento RESOURCE_COMPLETED
7. RabbitMQ recibe el mensaje
8. Python consume el evento
9. Python genera recomendaciones
```

---

# Explicación detallada del flujo

## 1. Estudiante completa un recurso

El flujo inicia cuando un estudiante completa un recurso académico dentro de la plataforma.

Ejemplo:

- Video
- Lectura
- Práctica
- Material complementario

El cliente realiza una solicitud HTTP al gateway.

Ejemplo conceptual:

```text
POST /api/students/{studentId}/resources/{resourceId}/complete
```

---

## 2. web-gateway-service reenvía la solicitud

El frontend no habla directamente con `academic-service`; primero pasa por `web-gateway-service`.

El microservicio `web-gateway-service`, desarrollado en Node.js + Express + TypeScript, recibe la solicitud del frontend y la reenvía al backend Java.

Responsabilidades en este paso:

- Validar la solicitud.
- Reenviar la petición a `academic-service`.
- Mantener al frontend desacoplado de los servicios internos.

---

## 3. academic-service registra el progreso

El microservicio `academic-service`, desarrollado en Java con Spring Boot, recibe la solicitud.

Responsabilidades en este paso:

- Validar la solicitud
- Registrar el recurso como completado
- Persistir el progreso del estudiante en PostgreSQL
- Persistir la actividad académica en PostgreSQL

En esta etapa también se pueden utilizar hilos para ejecutar tareas concurrentes.

Ejemplo:

- Persistir progreso
- Registrar actividad
- Publicar evento RabbitMQ

Evidencia persistente que deja este paso:

- Una fila en `student_progress`
- Una fila en `activity_log`
- Un evento `RESOURCE_COMPLETED` enviado a RabbitMQ

---

## 4. academic-service publica un evento

Después de registrar el progreso, el microservicio Java publica un evento en RabbitMQ.

Evento publicado:

```text
RESOURCE_COMPLETED
```

El objetivo del evento es notificar a otros servicios que el estudiante completó un recurso.

Información enviada en el mensaje:

- studentId
- subjectId
- courseId
- resourceId
- completedAt

---

# Comunicación distribuida mediante RabbitMQ

## Exchange

```text
academic.events.exchange
```

## Queue

```text
academic.events.queue
```

## Routing Key

```text
academic.resource.completed
```

---

## 5. RabbitMQ recibe el mensaje

RabbitMQ actúa como sistema de colas y middleware de mensajería.

Responsabilidades:

- Recibir eventos publicados
- Almacenar mensajes temporalmente
- Distribuir mensajes al consumidor correspondiente

Esto desacopla los servicios y permite comunicación asíncrona.

---

## 6. recommendation-worker consume el evento

El microservicio `recommendation-worker`, desarrollado en Python, consume el mensaje desde RabbitMQ.

Responsabilidades:

- Escuchar eventos académicos
- Procesar eventos RESOURCE_COMPLETED
- Analizar comportamiento del estudiante

El worker funciona de manera independiente al microservicio Java.
En esta primera entrega, el worker genera la recomendación y la deja registrada en logs.

---

## 7. recommendation-service genera recomendaciones

Finalmente, el sistema Python genera recomendaciones académicas para el estudiante.

Ejemplos:

- Cursos relacionados
- Recursos complementarios
- Material recomendado
- Nuevos temas de estudio

Estas recomendaciones pueden consultarse posteriormente mediante REST.

Ejemplo conceptual:

```text
GET /recommendations/{studentId}
```

En el estado actual del proyecto, esta consulta REST devuelve recomendaciones estáticas coherentes con la demo, mientras que el worker procesa el evento de forma asíncrona.

La persistencia del catálogo y del progreso queda completamente en `academic-service`, mientras que `recommendation-service` sigue expuesto como API REST desacoplada.

---

# Tecnologías involucradas en el flujo

| Componente | Tecnología |
|---|---|
| web-gateway-service | Node.js + Express + TypeScript |
| academic-service | Java + Spring Boot |
| recommendation-service | Python + FastAPI |
| recommendation-worker | Python |
| Sistema de colas | RabbitMQ |
| Persistencia | PostgreSQL |
| Infraestructura | Docker Compose |

---

# Objetivos distribuidos demostrados

El flujo demuestra:

- Uso de microservicios
- Comunicación REST
- Comunicación mediante colas
- Comunicación entre Java, Python y Node.js
- Procesamiento asíncrono
- Desacoplamiento de servicios
- Arquitectura distribuida
- Uso de Docker

---

# Acceso a la demo

## URLs locales

- Frontend: `http://localhost:5173`
- API Gateway: `http://localhost:3000`
- academic-service: `http://localhost:8080`
- recommendation-service: `http://localhost:8000`
- Keycloak: `http://localhost:8180`
- RabbitMQ Management: `http://localhost:15672`

## URL pública documentada

- `https://captain-assets-jet-sorry.trycloudflare.com`

## Comando de publicación

```bash
cloudflared tunnel --url http://localhost:5173
```

## Variables de producción sugeridas

- `NODE_ENV=production`
- `GATEWAY_CORS_ORIGIN=https://<tu-dominio-publico>`
- `VITE_API_BASE_URL=https://<tu-dominio-publico>`
- `VITE_GATEWAY_URL=https://<tu-dominio-publico>`
- `VITE_KEYCLOAK_URL=https://<tu-keycloak-publico>`
- `KEYCLOAK_ISSUER_URI=https://<tu-keycloak-publico>/realms/academic-platform`
- `KEYCLOAK_JWK_SET_URI=https://<tu-keycloak-publico>/realms/academic-platform/protocol/openid-connect/certs`
