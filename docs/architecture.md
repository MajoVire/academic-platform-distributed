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
        |---- PostgreSQL ----> PostgreSQL (persistencia académica)
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
- Persistir el catálogo académico
- Persistir el progreso estudiantil
- Persistir la bitácora de actividad
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

```text
academic-service ---> recommendation-service
```

Se utiliza para consultar recomendaciones académicas desde Python.

Ejemplo conceptual:

```text
GET /recommendations/{studentId}
```

---

# Comunicación mediante colas

La comunicación mediante colas ocurre usando RabbitMQ.

```text
academic-service ---> RabbitMQ ---> recommendation-worker
```

Cuando un estudiante completa un recurso:

1. academic-service registra el progreso
2. academic-service publica un evento
3. RabbitMQ almacena el mensaje
4. recommendation-worker consume el evento
5. recommendation-worker genera una recomendación a partir del evento recibido
6. recommendation-service expone las recomendaciones consultables por REST

---

# Evento principal

Evento utilizado:

```text
RESOURCE_COMPLETED
```

Exchange:

```text
academic.events.exchange
```

Queue:

```text
academic.events.queue
```

Routing Key:

```text
academic.resource.completed
```

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

En el estado actual, `academic-service` usa PostgreSQL como fuente real de persistencia cuando se ejecuta con el perfil `postgres`.

### Esquema de persistencia

| Tabla | Propósito | Detalle |
|---|---|---|
| `subjects` | Catálogo de materias | Materias académicas persistentes |
| `courses` | Catálogo de cursos | Cursos asociados a una materia |
| `resources` | Catálogo de recursos | Recursos asociados a un curso |
| `student_progress` | Progreso del estudiante | Una fila por recurso completado |
| `activity_log` | Bitácora de actividad | Evidencia del proceso y trazabilidad del hilo |

### Cambios importantes del modelo

- El catálogo ya no depende únicamente de estructuras en memoria.
- `student_progress` usa una fila por recurso completado, sin un campo `completed` redundante.
- `activity_log` conserva contexto adicional del evento:
  - `resource_id`
  - `resource_title`
  - `thread_name`
  - `completed_at`
- `init.sql` carga el esquema y los datos semilla iniciales.

---

# Flujo principal del sistema

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

# Objetivo distribuido

El proyecto demuestra:

- Uso de microservicios
- Comunicación REST
- Comunicación mediante colas
- Integración Java y Python
- Uso de hilos
- Uso de Docker
- Arquitectura distribuida
