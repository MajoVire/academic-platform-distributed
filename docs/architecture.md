# Arquitectura del Sistema

## Descripción general

La plataforma académica está diseñada utilizando una arquitectura basada en microservicios.

El objetivo es separar responsabilidades para facilitar:

- Escalabilidad
- Mantenimiento
- Comunicación distribuida
- Integración entre tecnologías diferentes

El sistema utiliza Java y Python comunicándose mediante REST y RabbitMQ.

---

# Arquitectura general

```text
Cliente/Postman
        |
        v
academic-service (Java)
        |
        |---- REST ----> recommendation-service (Python)
        |
        |---- RabbitMQ -> recommendation-worker (Python)
```

---

# Componentes del sistema

## academic-service

Microservicio principal desarrollado en Java con Spring Boot.

Responsabilidades:

- Consultar materias
- Consultar cursos
- Consultar recursos académicos
- Registrar progreso de estudiantes
- Publicar eventos académicos

Tecnologías:

- Java 17
- Spring Boot
- RabbitMQ
- PostgreSQL

---

## recommendation-service

Microservicio desarrollado en Python.

Responsabilidades:

- Generar recomendaciones académicas
- Exponer endpoints REST

Tecnologías:

- Python
- FastAPI

---

## recommendation-worker

Worker desarrollado en Python.

Responsabilidades:

- Consumir mensajes desde RabbitMQ
- Procesar eventos académicos
- Generar recomendaciones automáticas

Tecnologías:

- Python
- RabbitMQ

---

# Comunicación REST

La comunicación REST ocurre entre:


academic-service ---> recommendation-service


Se utiliza para consultar recomendaciones académicas desde Python.

Ejemplo conceptual:


GET /recommendations/{studentId}


---

# Comunicación mediante colas

La comunicación mediante colas ocurre usando RabbitMQ.


academic-service ---> RabbitMQ ---> recommendation-worker


Cuando un estudiante completa un recurso:

1. academic-service registra el progreso
2. academic-service publica un evento
3. RabbitMQ almacena el mensaje
4. recommendation-worker consume el evento
5. recommendation-service genera recomendaciones

---

# Evento principal

Evento utilizado:

RESOURCE_COMPLETED


Exchange:

academic.events.exchange

Queue:

academic.events.queue

Routing Key:

academic.resource.completed

---

# Infraestructura Docker

La infraestructura se ejecuta mediante Docker Compose.

Servicios configurados:

| Servicio | Puerto |
|---|---|
| PostgreSQL | 5432 |
| RabbitMQ | 5672 |
| RabbitMQ Management | 15672 |

---

# Base de datos

PostgreSQL almacena:

- Materias
- Cursos
- Recursos
- Progreso estudiantil
- Actividades académicas

Tablas principales:

- subjects
- courses
- resources
- student_progress
- activity_log

---

# Flujo principal del sistema

1. Estudiante completa recurso
2. Java registra progreso
3. Java publica evento RESOURCE_COMPLETED
4. RabbitMQ recibe el mensaje
5. Python consume el evento
6. Python genera recomendaciones

---

# Objetivo distribuido

El proyecto demuestra:

- Uso de microservicios
- Comunicación REST
- Comunicación mediante colas
- Integración Java y Python
- Uso de hilos
- Uso de Docker
- Arquitectura distribuida