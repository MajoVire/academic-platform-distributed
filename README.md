# Plataforma Académica Distribuida

Proyecto académico desarrollado para las asignaturas de Programación Web y Sistemas Distribuidos.

## Descripción

Plataforma web que permite consultar materias, cursos, recursos de aprendizaje, progreso de estudiantes y recomendaciones académicas. El sistema integra frontend, backend, base de datos, mensajería asincrónica y despliegue con Docker Compose.

## Tecnologías utilizadas

- React
- TypeScript
- Vite
- Tailwind CSS
- Java 17
- Spring Boot
- Python
- FastAPI
- Node.js
- Express
- PostgreSQL
- RabbitMQ
- Docker Compose

## Arquitectura

El proyecto está compuesto por varios servicios:

- Frontend: interfaz web desarrollada con React y TypeScript.
- Web Gateway Service: API Gateway desarrollado con Node.js y Express.
- Academic Service: microservicio principal desarrollado con Java y Spring Boot.
- Recommendation Service: servicio de recomendaciones desarrollado con Python y FastAPI.
- Recommendation Worker: consumidor de eventos mediante RabbitMQ.
- PostgreSQL: base de datos principal.
- RabbitMQ: cola de mensajes para comunicación asincrónica.

## Funcionalidades principales

- Consulta de materias y cursos.
- Consulta de recursos académicos.
- Registro de progreso de estudiantes.
- Generación de recomendaciones académicas.
- Comunicación síncrona mediante APIs REST.
- Comunicación asincrónica mediante RabbitMQ.

## Estado del proyecto

Proyecto académico en desarrollo.
