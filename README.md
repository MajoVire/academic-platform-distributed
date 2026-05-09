# Plataforma Académica Distribuida

Plataforma web académica distribuida desarrollada para las asignaturas de **Sistemas Distribuidos** y **Programación Web**.

El proyecto tiene como objetivo demostrar una arquitectura basada en microservicios que permita consultar materias, cursos complementarios, recursos de aprendizaje, progreso básico de estudiantes y recomendaciones académicas.

La primera entrega se enfoca en demostrar conceptos de Sistemas Distribuidos mediante:

- Uso de hilos.
- Uso de sistemas de colas.
- Comunicación entre Java y Python.
- Comunicación síncrona mediante REST.
- Comunicación asíncrona mediante RabbitMQ.
- Ejecución mediante contenedores Docker.
- Integración básica de servicios distribuidos.

---

## Panorama general

Este repositorio agrupa una solución académica distribuida compuesta por varios servicios.

La plataforma permite que un estudiante consulte contenido académico complementario y marque recursos como completados. A partir de esta acción, el sistema registra el progreso, publica un evento en RabbitMQ y permite generar recomendaciones académicas desde un servicio Python.

---

## Objetivo del proyecto

Implementar una arquitectura distribuida que demuestre:

- Uso de microservicios.
- Comunicación REST.
- Comunicación mediante colas.
- Integración entre servicios desarrollados en Java y Python.
- Uso de hilos para procesamiento concurrente.
- Procesamiento asíncrono mediante eventos.
- Despliegue local mediante Docker y Docker Compose.
- Separación de responsabilidades por componente.

---

## Arquitectura general

```text
Cliente / Postman
        |
        v
academic-service (Java + Spring Boot)
        |
        |---- REST ----> recommendation-service (Python + FastAPI)
        |
        |---- RabbitMQ ---> recommendation-worker (Python)
```

El sistema demuestra dos formas principales de comunicación distribuida:

```text
Comunicación síncrona:
academic-service ── REST ──► recommendation-service

Comunicación asíncrona:
academic-service ── RabbitMQ ──► recommendation-worker
```

---

## Tecnologías utilizadas

### Backend

- Java 17
- Spring Boot
- Python
- FastAPI

### Comunicación distribuida

- API REST
- RabbitMQ

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

## academic-service

`academic-service` es el microservicio académico principal del sistema.

Está desarrollado en **Java 17 con Spring Boot** y se encarga de gestionar la información académica base de la plataforma.

Responsabilidades principales:

- Consultar materias.
- Consultar cursos complementarios por materia.
- Consultar recursos de aprendizaje por curso.
- Registrar recursos completados por estudiantes.
- Consultar progreso académico básico.
- Ejecutar tareas concurrentes mediante hilos.
- Publicar eventos académicos en RabbitMQ.
- Consultar recomendaciones desde el servicio Python.

Para la primera entrega, este servicio utiliza repositorios en memoria, lo que permite avanzar sin depender directamente de PostgreSQL durante la etapa inicial.

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

La infraestructura contempla PostgreSQL como base de datos del proyecto.

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
postgres
```

Tablas principales consideradas:

- `subjects`
- `courses`
- `resources`
- `student_progress`
- `activity_log`

En la primera entrega, `academic-service` puede funcionar con datos en memoria. PostgreSQL queda preparado para una integración posterior o para el entorno completo gestionado por Docker Compose.

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
2. academic-service registra el progreso.
3. academic-service ejecuta tareas concurrentes usando hilos.
4. academic-service publica el evento RESOURCE_COMPLETED.
5. RabbitMQ recibe el mensaje.
6. recommendation-worker consume el evento.
7. El servicio Python procesa la información.
8. Se generan recomendaciones académicas.
```

Representación simplificada:

```text
Cliente / Postman
    |
    v
POST /api/students/{studentId}/resources/{resourceId}/complete
    |
    |-- Registra progreso del estudiante
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
| PostgreSQL | 5432 |
| RabbitMQ | 5672 |
| RabbitMQ Management | 15672 |

Servicios esperados en la integración:

```text
academic-service
recommendation-service
recommendation-worker
rabbitmq
postgres
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
| `RABBITMQ_HOST` | `localhost` | Host de RabbitMQ |
| `RABBITMQ_PORT` | `5672` | Puerto de RabbitMQ |
| `RABBITMQ_USERNAME` | `guest` | Usuario de RabbitMQ |
| `RABBITMQ_PASSWORD` | `guest` | Contraseña de RabbitMQ |
| `ACADEMIC_EVENTS_EXCHANGE` | `academic.events.exchange` | Exchange para eventos académicos |
| `ACADEMIC_EVENTS_QUEUE` | `academic.events.queue` | Queue para eventos académicos |
| `ACADEMIC_RESOURCE_COMPLETED_ROUTING_KEY` | `academic.resource.completed` | Routing key del evento de completado |
| `RECOMMENDATION_SERVICE_URL` | `http://localhost:8000` | URL del servicio Python de recomendaciones |

Para integración con Docker Compose, la configuración habitual es:

```text
SERVER_PORT=8080
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=guest
RABBITMQ_PASSWORD=guest
RECOMMENDATION_SERVICE_URL=http://recommendation-service:8000
```

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
docker compose up -d
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
Contraseña: guest
```

---

## Colección Postman

La colección de pruebas se encuentra en:

```text
postman/collection.json
```

Incluye pruebas para:

- Health check.
- Consulta de materias.
- Consulta de cursos.
- Consulta de recursos.
- Registro de recurso completado.
- Consulta de progreso.
- Consulta de recomendaciones.

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
- Microservicio `academic-service` implementado.
- Endpoints académicos básicos.
- Uso de hilos en el flujo de completado de recursos.
- Publicación del evento `RESOURCE_COMPLETED`.
- Cliente REST hacia `recommendation-service`.

---

## Notas de integración

- `academic-service` no requiere PostgreSQL para esta primera entrega, ya que usa repositorios en memoria.
- El flujo principal usa la ruta:

```text
POST /api/students/{studentId}/resources/{resourceId}/complete
```

- El servicio maneja de forma simple la ausencia temporal de RabbitMQ o del servicio Python para no detener toda la aplicación.
- Los valores por defecto de `application.yml` son para pruebas locales.
- En Docker Compose, las variables de entorno deben ajustarse según los nombres de los servicios.
- El `Dockerfile` local de pruebas dentro de `academic-service/` no se versiona a propósito, salvo que el equipo decida incluirlo en una etapa posterior.

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
- Integración entre Java y Python.
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

El sistema puede ampliarse posteriormente con:

- Persistencia completa en PostgreSQL.
- Autenticación real.
- Frontend web.
- Panel administrativo.
- Orquestación con Kubernetes.
- Mayor lógica de recomendaciones.