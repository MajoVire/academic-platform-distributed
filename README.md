# Plataforma Académica Distribuida

Proyecto académico desarrollado para las asignaturas de Sistemas Distribuidos y Programación Web.

La plataforma permite consultar materias, cursos complementarios, recursos de aprendizaje y progreso básico de estudiantes mediante una arquitectura basada en microservicios.

---

# Tecnologías utilizadas

## Backend

* Java 17
* Spring Boot
* Python
* FastAPI

## Comunicación distribuida

* RabbitMQ
* API REST

## Base de datos

* PostgreSQL

## Infraestructura

* Docker
* Docker Compose

## Control de versiones

* Git
* GitHub

---

# Arquitectura general

El sistema está compuesto por varios servicios distribuidos:

Cliente/Postman
        |
        v
academic-service (Java)
        |
        |---- REST ----> recommendation-service (Python)
        |
        |---- RabbitMQ -> recommendation-worker (Python)

## Componentes

### academic-service

Microservicio principal desarrollado en Java con Spring Boot.

Responsabilidades:

* Consultar materias
* Consultar cursos complementarios
* Consultar recursos académicos
* Registrar progreso del estudiante
* Publicar eventos en RabbitMQ

---

### recommendation-service

Microservicio desarrollado en Python.

Responsabilidades:

* Generar recomendaciones académicas
* Exponer endpoints REST para recomendaciones

---

### recommendation-worker

Worker desarrollado en Python.

Responsabilidades:

* Consumir eventos desde RabbitMQ
* Procesar eventos académicos
* Generar recomendaciones automáticas

---

# Comunicación entre servicios

El proyecto implementa dos tipos de comunicación distribuida:

## Comunicación REST

academic-service ---> recommendation-service
Se utiliza para consultar recomendaciones académicas.

---

## Comunicación mediante colas


academic-service ---> RabbitMQ ---> recommendation-worker
Se utiliza para publicar y consumir eventos académicos.

Evento principal:
RESOURCE_COMPLETED


---

# Infraestructura Docker

El proyecto utiliza Docker Compose para levantar todos los servicios necesarios.

Servicios actuales:

| Servicio            | Puerto |
| ------------------- | ------ |
| PostgreSQL          | 5432   |
| RabbitMQ            | 5672   |
| RabbitMQ Management | 15672  |

---

# Cómo levantar el proyecto

## 1. Requisitos

Tener instalado:

* Docker Desktop
* Git
* Visual Studio Code

---

## 2. Clonar repositorio

git clone <URL_DEL_REPOSITORIO>

Entrar al proyecto:
cd academic-platform-distributed

---

## 3. Levantar infraestructura

Ejecutar:
docker compose up -d

---

## 4. Verificar contenedores

docker ps

Deben aparecer:

* postgres
* rabbitmq

---

# PostgreSQL

## Base de datos


academic_platform


## Usuario


postgres


## Contraseña


postgres

## Tablas iniciales

* subjects
* courses
* resources
* student_progress
* activity_log

---

# RabbitMQ

## Acceso al panel web

Abrir en navegador:


http://localhost:15672


## Credenciales

Usuario:
guest

Contraseña:
guest


---

# Configuración de RabbitMQ

## Exchange
academic.events.exchange


## Queue
academic.events.queue

## Routing Key

academic.resource.completed

---

# Flujo principal del sistema

1. Estudiante completa recurso
2. academic-service registra progreso
3. academic-service publica evento RESOURCE_COMPLETED
4. RabbitMQ recibe el mensaje
5. recommendation-worker consume el evento
6. recommendation-service genera recomendaciones

---

# Estado actual de infraestructura

Actualmente la infraestructura contiene:

* PostgreSQL funcionando en Docker
* RabbitMQ funcionando en Docker
* Base de datos inicial configurada
* Scripts SQL iniciales
* Docker Compose configurado

# Comandos útiles

## Levantar contenedores
docker compose up -d

## Detener contenedores
docker compose down

## Ver contenedores activos
docker ps

## Ver logs PostgreSQL
docker logs postgres

## Ver logs RabbitMQ
docker logs rabbitmq

---

