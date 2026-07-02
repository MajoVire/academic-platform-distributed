# Plataforma Académica Distribuida

Plataforma web académica distribuida desarrollada para las asignaturas de **Sistemas Distribuidos** y **Programación Web**.

El proyecto tiene como objetivo demostrar una arquitectura basada en microservicios que permita consultar materias, cursos complementarios, recursos de aprendizaje, progreso básico de estudiantes y recomendaciones académicas.

La primera entrega se enfoca en demostrar conceptos de Sistemas Distribuidos mediante:

- Uso de hilos.
- Uso de sistemas de colas.
- Comunicación entre Java, Python y Node.js.
- Comunicación síncrona mediante REST.
- Comunicación asíncrona mediante RabbitMQ.
- Ejecución mediante contenedores Docker.
- Integración básica de servicios distribuidos.

---

## Panorama general

Este repositorio agrupa una solución académica distribuida compuesta por varios servicios.

La plataforma permite que un estudiante consulte contenido académico complementario y marque recursos como completados. El frontend consume `web-gateway-service`, que reenvía las solicitudes a `academic-service`. A partir de esta acción, el sistema registra el progreso, publica un evento en RabbitMQ y permite generar recomendaciones académicas desde un servicio Python.

---

## Objetivo del proyecto

Implementar una arquitectura distribuida que demuestre:

- Uso de microservicios.
- Comunicación REST.
- Comunicación mediante colas.
- Integración entre servicios desarrollados en Java, Python y Node.js.
- Uso de hilos para procesamiento concurrente.
- Procesamiento asíncrono mediante eventos.
- Despliegue local mediante Docker y Docker Compose.
- Separación de responsabilidades por componente.

---

## Arquitectura general

```text
Cliente / React Frontend (Vite) / Postman
        |---- Autenticacion OAuth2 ----> Keycloak (Identity Provider)
        |
        v
web-gateway-service (Node.js + Express + TypeScript)
        |
        |---- REST ----> academic-service (Java + Spring Boot + Spring Security)
        |
        |---- REST ----> recommendation-service (Python + FastAPI)
        |
        |---- RabbitMQ ---> recommendation-worker (Python)
```

El sistema demuestra la comunicación distribuida incluyendo flujos de seguridad:

```text
Comunicación síncrona:
frontend ── REST ──► web-gateway-service ── REST ──► academic-service
academic-service ── REST ──► recommendation-service

Comunicación asíncrona:
academic-service ── RabbitMQ ──► recommendation-worker

Seguridad (OAuth2):
Frontend ── Token ──► Keycloak
Frontend ── Bearer JWT ──► academic-service
```

---

## Tecnologías utilizadas

### Backend

- Java 17
- Spring Boot
- Node.js
- Express
- TypeScript
- Python
- FastAPI

### Comunicación distribuida

- API REST
- RabbitMQ

### Seguridad e Identidad

- Keycloak (OAuth2 / OpenID Connect)
- Spring Security Resource Server
- keycloak-js

### Base de datos

- PostgreSQL

### Infraestructura

- Docker
- Docker Compose

### Herramientas

- Git
- GitHub
- Postman
- VS Code

---

## Componentes del sistema

El repositorio está organizado por componentes:

```text
academic-platform-distributed/
├── frontend/
├── web-gateway-service/
├── academic-service/
├── recommendation-service/
├── recommendation-worker/
├── database/
├── docs/
├── postman/
├── docker-compose.yml
└── README.md
```

---

## web-gateway-service

`web-gateway-service` es la puerta de entrada HTTP para el frontend.

Está desarrollado en **Node.js + Express + TypeScript** y funciona como API Gateway / Backend for Frontend.

Responsabilidades principales:

- Recibir peticiones del frontend.
- Reenviar las rutas académicas al servicio Java.
- Mantener desacoplado al frontend de los servicios internos.
- Exponer un único punto de entrada para la demo web.

Comunicación esperada:

```text
frontend ---> web-gateway-service ---> academic-service
```

El gateway no reemplaza la lógica interna de `academic-service`; solo centraliza el acceso externo.

---

## academic-service

`academic-service` es el microservicio académico principal del sistema.

Está desarrollado en **Java 17 con Spring Boot** y se encarga de gestionar la información académica base de la plataforma.

Responsabilidades principales:

- Consultar materias.
- Consultar cursos complementarios por materia.
- Consultar recursos de aprendizaje por curso.
- Inscribir estudiantes a cursos.
- Consultar los cursos inscritos por estudiante.
- Registrar recursos completados por estudiantes.
- Consultar progreso académico básico vinculado a la sesión del estudiante.
- Ejecutar tareas concurrentes mediante hilos.
- Publicar eventos académicos en RabbitMQ.
- Consultar recomendaciones desde el servicio Python.

Para la primera entrega, este servicio utiliza repositorios en memoria, lo que permite avanzar sin depender directamente de PostgreSQL durante la etapa inicial.

En la arquitectura web actual, `academic-service` recibe las solicitudes reenviadas por `web-gateway-service`.

---

## recommendation-service

`recommendation-service` es el microservicio de recomendaciones.

Está desarrollado en **Python con FastAPI**.

Responsabilidades principales:

- Exponer endpoints REST para recomendaciones académicas.
- Recibir o consultar información relacionada con estudiantes.
- Devolver recomendaciones académicas básicas.

Comunicación esperada:

```text
web-gateway-service ---> academic-service
academic-service ---> recommendation-service
```

Ejemplo conceptual:

```text
GET /recommendations/{studentId}
```

---

## recommendation-worker

`recommendation-worker` es el consumidor de eventos académicos.

Está desarrollado en **Python** y se encarga de procesar mensajes publicados en RabbitMQ.

Responsabilidades principales:

- Consumir mensajes desde RabbitMQ.
- Procesar eventos académicos.
- Generar recomendaciones automáticas.
- Desacoplar el procesamiento de recomendaciones del flujo principal del servicio académico.

En esta primera entrega el worker registra la recomendación generada en logs. La recomendación consultable por REST sigue siendo la expuesta por `recommendation-service`.

---

## Comunicación REST

La comunicación REST se usa para consultas síncronas entre servicios.

```text
academic-service ---> recommendation-service
```

Uso principal:

```text
GET /recommendations/{studentId}
```

Esta comunicación permite que el servicio académico consulte recomendaciones generadas por el servicio Python.

---

## Comunicación mediante colas

La comunicación mediante colas se usa para procesamiento asíncrono.

```text
academic-service ---> RabbitMQ ---> recommendation-worker
```

Evento principal:

```text
RESOURCE_COMPLETED
```

Este evento se publica cuando un estudiante completa un recurso académico.

---

## Configuración RabbitMQ

Configuración base utilizada para los eventos académicos:

### Exchange

```text
academic.events.exchange
```

### Queue

```text
academic.events.queue
```

### Routing Key

```text
academic.resource.completed
```

Evento esperado:

```json
{
  "eventType": "RESOURCE_COMPLETED",
  "studentId": 1,
  "subjectId": 1,
  "courseId": 1,
  "resourceId": 1,
  "resourceTitle": "Introducción a Docker",
  "completedAt": "2026-05-02T12:00:00"
}
```

---

## Base de datos PostgreSQL

La infraestructura contempla PostgreSQL como base de datos real del dominio académico.

Configuración base:

### Base de datos

```text
academic_platform
```

### Usuario

```text
postgres
```

### Contraseña

```text
change_this_postgres_password
```

Tablas principales consideradas:

- `subjects`
- `courses`
- `resources`
- `student_progress`
- `activity_log`

`academic-service` usa PostgreSQL cuando se ejecuta con el perfil `postgres` dentro de Docker Compose.

### Qué representa cada tabla

| Tabla | Qué guarda | Comentario |
|---|---|---|
| `subjects` | Materias | Catálogo base de la plataforma |
| `courses` | Cursos complementarios | Dependen de una materia |
| `resources` | Recursos de aprendizaje | Dependen de un curso |
| `student_progress` | Recursos completados por estudiante | Una fila por recurso completado |
| `activity_log` | Bitácora académica | Guarda trazabilidad, incluyendo el hilo que procesó la acción |

### Cambios conceptuales importantes

- `subjects`, `courses` y `resources` dejaron de vivir solo en memoria y ahora forman parte del catálogo persistente.
- `student_progress` ya no usa un campo `completed`; la existencia de la fila representa el recurso completado.
- `activity_log` pasó de ser un registro genérico a una bitácora con más contexto:
  - `resource_id`
  - `resource_title`
  - `thread_name`
  - `completed_at`
- `init.sql` crea el esquema inicial y carga el catálogo semilla.
- El script de inicialización de PostgreSQL se ejecuta solo la primera vez que el volumen está vacío.

---

## Endpoints de web-gateway-service

Base path:

```text
/api
```

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/health` | Health check del gateway y del servicio académico |
| GET | `/api/subjects` | Lista todas las materias |
| GET | `/api/subjects/{subjectId}/courses` | Lista los cursos de una materia |
| GET | `/api/courses/{courseId}/resources` | Lista los recursos de un curso |
| POST | `/api/students/{studentId}/resources/{resourceId}/complete` | Registra un recurso como completado |
| GET | `/api/students/{studentId}/progress` | Consulta el progreso del estudiante |
| GET | `/api/students/{studentId}/recommendations` | Consulta recomendaciones desde el servicio Python |

---

## Endpoints de academic-service

Base path:

```text
/api
```

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/subjects` | Lista todas las materias |
| GET | `/api/subjects/{subjectId}/courses` | Lista los cursos de una materia |
| GET | `/api/courses/{courseId}/resources` | Lista los recursos de un curso |
| POST | `/api/students/{studentId}/resources/{resourceId}/complete` | Registra un recurso como completado |
| GET | `/api/students/{studentId}/progress` | Consulta el progreso del estudiante |
| GET | `/api/students/{studentId}/recommendations` | Consulta recomendaciones desde el servicio Python |
| GET | `/api/health` | Health check del servicio |

---

## Flujo principal del sistema

El flujo principal de la primera entrega es:

```text
1. El estudiante completa un recurso.
2. Frontend envía la acción al web-gateway-service.
3. web-gateway-service reenvía la solicitud a academic-service.
4. academic-service registra el progreso en PostgreSQL.
5. academic-service registra la actividad académica en PostgreSQL.
6. academic-service ejecuta tareas concurrentes usando hilos.
7. academic-service publica el evento RESOURCE_COMPLETED.
8. RabbitMQ recibe el mensaje.
9. recommendation-worker consume el evento.
10. El servicio Python procesa la información.
11. Se generan recomendaciones académicas.
```

Representación simplificada:

```text
Frontend / Postman
    |
    v
web-gateway-service
    |
    v
POST /api/students/{studentId}/resources/{resourceId}/complete
    |
    |-- Registra progreso persistente en PostgreSQL
    |-- Registra actividad académica persistente en PostgreSQL
    |-- Ejecuta tareas concurrentes usando hilos
    |-- Publica evento RESOURCE_COMPLETED en RabbitMQ
    |-- Permite consultar recomendaciones desde Python
```

---

## Infraestructura Docker

La infraestructura permite levantar los servicios necesarios para la primera entrega.

Servicios configurados:

| Servicio | Puerto |
|---|---|
| web-gateway-service | 3000 |
| academic-service | 8080 |
| PostgreSQL | 5432 |
| RabbitMQ | 5672 |
| RabbitMQ Management | 15672 |
| Keycloak | 8180 |

Servicios esperados en la integración:

```text
web-gateway-service
academic-service
recommendation-service
recommendation-worker
rabbitmq
postgres
keycloak
```

---

## Configuración de academic-service

El servicio trae valores por defecto en:

```text
academic-service/src/main/resources/application.yml
```

Por ello, puede ejecutarse localmente sin crear un archivo `.env`.

Variables soportadas:

| Variable | Default | Uso |
|---|---|---|
| `SERVER_PORT` | `8080` | Puerto del servicio Spring Boot |
| `RABBITMQ_HOST` | `rabbitmq` | Host de RabbitMQ |
| `RABBITMQ_PORT` | `5672` | Puerto de RabbitMQ |
| `RABBITMQ_USERNAME` | `guest` | Usuario de RabbitMQ |
| `RABBITMQ_PASSWORD` | `change_this_rabbitmq_password` | Contraseña de RabbitMQ |
| `ACADEMIC_EVENTS_EXCHANGE` | `academic.events.exchange` | Exchange para eventos académicos |
| `ACADEMIC_EVENTS_QUEUE` | `academic.events.queue` | Queue para eventos académicos |
| `ACADEMIC_RESOURCE_COMPLETED_ROUTING_KEY` | `academic.resource.completed` | Routing key del evento de completado |
| `RECOMMENDATION_SERVICE_URL` | `http://recommendation-service:8000` | URL del servicio Python de recomendaciones |
| `POSTGRES_DB` | `academic_platform` | Nombre de la base académica |
| `POSTGRES_USER` | `postgres` | Usuario de PostgreSQL |
| `POSTGRES_PASSWORD` | `change_this_postgres_password` | Contraseña de PostgreSQL |
| `POSTGRES_HOST` | `postgres` | Host de PostgreSQL en Docker Compose |
| `POSTGRES_HOST_PORT` | `5432` | Puerto del host para PostgreSQL en Docker Compose |

Para integración con Docker Compose, la configuración habitual es:

```text
SERVER_PORT=8080
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=guest
RABBITMQ_PASSWORD=change_this_rabbitmq_password
RECOMMENDATION_SERVICE_URL=http://recommendation-service:8000
POSTGRES_DB=academic_platform
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change_this_postgres_password
POSTGRES_HOST=postgres
POSTGRES_HOST_PORT=5432
```

---

## Configuración de web-gateway-service

El gateway se configura con variables simples para enrutar al backend Java.

Variables soportadas:

| Variable | Default | Uso |
|---|---|---|
| `WEB_GATEWAY_PORT` | `3000` | Puerto del gateway |
| `ACADEMIC_SERVICE_URL` | `http://academic-service:8080` | URL del servicio Java |
| `GATEWAY_CORS_ORIGIN` | `http://localhost:5173` | Origen permitido para el frontend |
| `REQUEST_TIMEOUT_MS` | `5000` | Timeout de las peticiones hacia academic-service |
| `NODE_ENV` | `development` | Modo de ejecución |

Para integración con Docker Compose, la configuración habitual es:

```text
WEB_GATEWAY_PORT=3000
ACADEMIC_SERVICE_URL=http://academic-service:8080
GATEWAY_CORS_ORIGIN=http://localhost:5173
REQUEST_TIMEOUT_MS=5000
NODE_ENV=development
```

---

## Persistencia en academic-service

El servicio Java persiste en PostgreSQL cuando corre con el perfil `postgres`.

La estructura de datos queda organizada así:

- `subjects`: materias del catálogo académico.
- `courses`: cursos complementarios asociados a una materia.
- `resources`: recursos de aprendizaje asociados a un curso.
- `student_progress`: progreso real del estudiante, una fila por recurso completado.
- `activity_log`: historial de actividad académica y trazabilidad del flujo.

### Qué cambió respecto a la versión en memoria

- El catálogo ya no depende solo de estructuras internas de Java.
- El progreso persiste entre reinicios.
- La actividad queda registrada con contexto adicional para auditoría.
- `activity_log` conserva el recurso, el hilo y el instante del completado.

### Modelo de tablas

| Tabla | Función | Observación |
|---|---|---|
| `subjects` | Materias | Tabla maestra |
| `courses` | Cursos complementarios | Relación con `subjects` |
| `resources` | Recursos de aprendizaje | Relación con `courses` |
| `student_progress` | Recursos completados | Una fila = un completado |
| `activity_log` | Bitácora de actividad | Incluye `thread_name` y `resource_title` |

---

## Levantar el proyecto

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
```

Entrar al proyecto:

```bash
cd academic-platform-distributed
```

### 2. Levantar la infraestructura

```bash
docker compose up --build -d
```

Si el puerto `5432` del host ya está ocupado, puedes usar:

```bash
POSTGRES_HOST_PORT=5433 docker compose up --build -d
```

### 3. Verificar contenedores

```bash
docker ps
```

### 4. Detener los servicios

```bash
docker compose down
```

---

## Ejecutar academic-service localmente

Desde la carpeta `academic-service/`:

```bash
mvn test
mvn spring-boot:run
```

Para generar el artefacto:

```bash
mvn clean package
```

Para ejecutar el `.jar` generado:

```bash
java -jar target/academic-service.jar
```

---

## Acceso a RabbitMQ

Abrir en el navegador:

```text
http://localhost:15672
```

Credenciales por defecto:

```text
Usuario: guest
Contraseña: change_this_rabbitmq_password
```

---

## Colección Postman

La colección de pruebas se encuentra en:

```text
postman/collection.json
```

Incluye pruebas para:

- Gateway web.
- Health check.
- Consulta de materias.
- Consulta de cursos por materia.
- Consulta de recursos por curso.
- Registro de recurso completado.
- Consulta de progreso.
- Consulta de recomendaciones.
- Health check de `recommendation-service`.
- Consulta de recomendaciones en `recommendation-service`.

Variables de la colección:

- `gateway_base_url`
- `academic_base_url`
- `recommendation_base_url`
- `student_id`
- `subject_id`
- `course_id`
- `resource_id`

Orden sugerido para la demo en Postman:

1. `Web Gateway > Health Check`
2. `Web Gateway > Get Subjects`
3. `Web Gateway > Get Courses By Subject`
4. `Web Gateway > Get Resources By Course`
5. `Web Gateway > Complete Resource`
6. `Web Gateway > Get Progress`
7. `Web Gateway > Get Recommendations`
8. `Academic Service > Health Check`
9. `Recommendation Service > Health Check`
10. `Recommendation Service > Get Recommendations By Student`

---

## Documentación adicional

Documentación de arquitectura:

```text
docs/architecture.md
```

Documentación del flujo distribuido:

```text
docs/demo-flow.md
```

---

## Pruebas

La suite actual de `academic-service` incluye pruebas para:

- Controladores REST.
- Publicación de eventos RabbitMQ.
- Cliente REST hacia el servicio Python.
- Repositorios en memoria.
- Arranque de la aplicación.

También se pueden realizar pruebas manuales mediante:

- Postman.
- curl.
- Panel de RabbitMQ.
- Logs de los servicios.

---

## Estado actual

Actualmente el proyecto cuenta con:

- Infraestructura Docker inicial.
- PostgreSQL configurado.
- RabbitMQ configurado.
- Base de datos inicial.
- Arquitectura documentada.
- Flujo distribuido documentado.
- Colección Postman.
- `web-gateway-service` implementado.
- Frontend configurado para consumir el gateway.
- Microservicio `academic-service` implementado.
- Endpoints académicos básicos.
- Uso de hilos en el flujo de completado de recursos.
- Publicación del evento `RESOURCE_COMPLETED`.
- Cliente REST hacia `recommendation-service`.

Notas importantes del estado actual:

- `academic-service` usa repositorios en memoria para catálogo y progreso.
- PostgreSQL está levantado y documentado, pero todavía no está conectado como persistencia real del microservicio.
- `web-gateway-service` funciona como fachada HTTP para el frontend.
- El worker consume `RESOURCE_COMPLETED` y genera la recomendación en logs.
- La respuesta REST de recomendaciones sigue saliendo desde `recommendation-service`.

---

## Notas de integración

- `academic-service` no requiere PostgreSQL para esta primera entrega, ya que usa repositorios en memoria.
- El frontend debe consumir `web-gateway-service` y no `academic-service` directamente.
- El flujo principal usa la ruta:

```text
POST /api/students/{studentId}/resources/{resourceId}/complete
```

- El servicio maneja de forma simple la ausencia temporal de RabbitMQ o del servicio Python para no detener toda la aplicación.
- Los valores por defecto de `application.yml` son para pruebas locales.
- En Docker Compose, las variables de entorno deben ajustarse según los nombres de los servicios.
- Si trabajas sobre un entorno local donde `5432` ya está ocupado, usa `POSTGRES_HOST_PORT`.

---

## Estructura de academic-service

```text
academic-service/
├── src/main/java/
├── src/main/resources/
└── src/test/java/
```

Estructura lógica del código:

```text
controller/
service/
repository/
model/
dto/
config/
client/
messaging/
exception/
```

---

## Objetivos distribuidos demostrados

El proyecto demuestra:

- Arquitectura distribuida.
- Comunicación síncrona mediante REST.
- Comunicación asíncrona mediante RabbitMQ.
- Integración entre Java, Python y Node.js.
- Uso de sistemas de colas.
- Uso de hilos.
- Microservicios.
- Contenedores Docker.
- Procesamiento desacoplado.
- Separación de responsabilidades por servicio.

---

## Estado de la primera entrega

La implementación actual está enfocada en la primera entrega de Sistemas Distribuidos.

El objetivo principal de esta etapa es demostrar un flujo distribuido funcional, no implementar todavía una plataforma académica completa.

**Integraciones recientes:**
- Frontend web interactivo desarrollado en React (Vite + TailwindCSS).
- Autenticación real basada en estándares usando OAuth2 con Keycloak como proveedor de identidad, garantizando un ecosistema seguro (Default Deny).

El sistema puede ampliarse posteriormente con:

- Persistencia completa en PostgreSQL.
- Panel administrativo.
- Orquestación con Kubernetes.
- Mayor lógica de recomendaciones.

---

## Kubernetes

La rama Kubernetes complementa la integración Web con manifiestos de despliegue, servicios, ConfigMaps, secretos y escalado horizontal.

Documentación útil:

- [Kubernetes Deployment](docs/kubernetes-deployment.md)
- [Kubernetes Scaling and Load Test](docs/kubernetes-scaling-and-load-test.md)
- [Flujo RabbitMQ](docs/rabbitmq-flow.md)

Resumen de esta capa:

- `academic-service` expone el catálogo, el progreso y la publicación de eventos.
- `recommendation-worker` consume `RESOURCE_COMPLETED` y publica `RECOMMENDATION_GENERATED`.
- `web-gateway-service` centraliza el acceso HTTP y Socket.IO.
- `frontend` consume el gateway y recibe notificaciones en tiempo real.

Validación rápida en Kubernetes:

```bash
kubectl get pods -n academic-platform
kubectl get svc -n academic-platform
kubectl get deploy -n academic-platform
kubectl get hpa -n academic-platform
kubectl top pods -n academic-platform
```

Notas importantes:

- Kubernetes usa `academic_platform_rabbitmq` como usuario del broker.
- Docker Compose usa `guest` por compatibilidad local.
- El HPA de `recommendation-worker` requiere `metrics-server`.
