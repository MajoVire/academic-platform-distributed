# Flujo Principal del Sistema

## Descripción general

El sistema implementa un flujo distribuido basado en microservicios, comunicación REST y comunicación mediante colas usando RabbitMQ.

El objetivo principal es demostrar cómo múltiples tecnologías pueden trabajar juntas dentro de una arquitectura distribuida.

---

# Flujo distribuido principal

```text
1. Estudiante completa recurso
2. Java persiste progreso en PostgreSQL
3. Java registra actividad académica en PostgreSQL
4. Java publica evento RESOURCE_COMPLETED
5. RabbitMQ recibe el mensaje
6. Python consume el evento
7. Python genera recomendaciones
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

El cliente realiza una solicitud HTTP al microservicio Java.

Ejemplo conceptual:

```text
POST /api/students/{studentId}/resources/{resourceId}/complete
```

---

## 2. academic-service registra el progreso

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

## 3. academic-service publica un evento

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

## 4. RabbitMQ recibe el mensaje

RabbitMQ actúa como sistema de colas y middleware de mensajería.

Responsabilidades:

- Recibir eventos publicados
- Almacenar mensajes temporalmente
- Distribuir mensajes al consumidor correspondiente

Esto desacopla los servicios y permite comunicación asíncrona.

---

## 5. recommendation-worker consume el evento

El microservicio `recommendation-worker`, desarrollado en Python, consume el mensaje desde RabbitMQ.

Responsabilidades:

- Escuchar eventos académicos
- Procesar eventos RESOURCE_COMPLETED
- Analizar comportamiento del estudiante

El worker funciona de manera independiente al microservicio Java.
En esta primera entrega, el worker genera la recomendación y la deja registrada en logs.

---

## 6. recommendation-service genera recomendaciones

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
- Comunicación entre Java y Python
- Procesamiento asíncrono
- Desacoplamiento de servicios
- Arquitectura distribuida
- Uso de Docker
