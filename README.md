# academic-platform-distributed
Plataforma web academica distribuida para la materia de Sistemas Distribuidos.

## Panorama General
Este repositorio agrupa una solucion academica distribuida pensada para demostrar:

- uso de hilos,
- uso de colas,
- comunicacion entre Java y Python,
- comunicacion por REST y RabbitMQ,
- ejecucion con contenedores.

La primera entrega se centra en el microservicio `academic-service`, que expone el backend academico principal.

## academic-service
`academic-service` esta implementado en Java 17 con Spring Boot y actualmente cubre:

- consulta de materias,
- consulta de cursos por materia,
- consulta de recursos por curso,
- registro de recursos completados,
- consulta de progreso del estudiante,
- consulta de recomendaciones al servicio Python,
- publicacion del evento `RESOURCE_COMPLETED` en RabbitMQ,
- procesamiento concurrente del flujo de completado de recursos.

El servicio usa repositorios en memoria para permitir avanzar sin depender de PostgreSQL en esta etapa.

## Endpoints
Base path: `/api`

| Metodo | Endpoint | Descripcion |
| --- | --- | --- |
| GET | `/api/subjects` | Lista todas las materias |
| GET | `/api/subjects/{subjectId}/courses` | Lista los cursos de una materia |
| GET | `/api/courses/{courseId}/resources` | Lista los recursos de un curso |
| POST | `/api/students/{studentId}/resources/{resourceId}/complete` | Registra un recurso como completado |
| GET | `/api/students/{studentId}/progress` | Consulta el progreso del estudiante |
| GET | `/api/students/{studentId}/recommendations` | Consulta recomendaciones desde el servicio Python |
| GET | `/api/health` | Health check del servicio |

## Configuracion
El servicio ya trae valores por defecto en `academic-service/src/main/resources/application.yml`, asi que puede ejecutarse sin crear `.env`.
Los valores documentados abajo corresponden a la etapa de pruebas locales y sirven como referencia inicial.
Para la version final en Docker Compose, la infraestructura puede y debe sobrescribirlos segun el entorno.

Variables soportadas:

| Variable | Default | Uso |
| --- | --- | --- |
| `SERVER_PORT` | `8080` | Puerto del servicio Spring Boot |
| `RABBITMQ_HOST` | `localhost` | Host de RabbitMQ |
| `RABBITMQ_PORT` | `5672` | Puerto de RabbitMQ |
| `RABBITMQ_USERNAME` | `guest` | Usuario de RabbitMQ |
| `RABBITMQ_PASSWORD` | `guest` | Clave de RabbitMQ |
| `ACADEMIC_EVENTS_EXCHANGE` | `academic.events.exchange` | Exchange para eventos academicos |
| `ACADEMIC_EVENTS_QUEUE` | `academic.events.queue` | Queue para eventos academicos |
| `ACADEMIC_RESOURCE_COMPLETED_ROUTING_KEY` | `academic.resource.completed` | Routing key del evento de completado |
| `RECOMMENDATION_SERVICE_URL` | `http://localhost:8000` | URL del servicio Python de recomendaciones |

Para integracion con Docker Compose, la configuracion habitual es:

- `RABBITMQ_HOST=rabbitmq`
- `RECOMMENDATION_SERVICE_URL=http://recommendation-service:8000`
- `SERVER_PORT=8080`
- `RABBITMQ_PORT=5672`
- `RABBITMQ_USERNAME=guest`
- `RABBITMQ_PASSWORD=guest`

## Ejecutar localmente
Desde la carpeta `academic-service/`:

```bash
mvn test
mvn spring-boot:run
```

Si quieres generar el artefacto:

```bash
mvn clean package
java -jar target/academic-service.jar
```

## Pruebas
La suite actual incluye pruebas para:

- controladores REST,
- publicacion de eventos RabbitMQ,
- cliente REST hacia el servicio Python,
- repositorio en memoria,
- arranque de la aplicacion.

## Integracion
Este modulo esta pensado para ser consumido por la infraestructura que levanta:

- `academic-service`
- `recommendation-service`
- `recommendation-worker`
- `rabbitmq`
- `postgres`

Notas utiles para integracion:

- `academic-service` no requiere PostgreSQL para esta primera entrega.
- El flujo principal usa la ruta `POST /api/students/{studentId}/resources/{resourceId}/complete`.
- El servicio maneja de forma simple la ausencia temporal del servicio Python y de RabbitMQ para no detener toda la aplicacion.
- El `Dockerfile` local de pruebas dentro de `academic-service/` no se versiona a proposito.
- Los valores por defecto del `application.yml` son solo para pruebas locales; en el despliegue Docker deben ser ajustados por la integracion.

## Estructura

```text
academic-service/
  src/main/java/
  src/main/resources/
  src/test/java/
```

## Estado actual
La implementacion esta enfocada en la primera entrega de Sistemas Distribuidos y todavia puede ampliarse con la infraestructura compartida y la evidencia de demo.
