# Plataforma Académica Distribuida

Proyecto académico desarrollado para las asignaturas de Sistemas Distribuidos y Programación Web.

La plataforma permite consultar materias, cursos complementarios, recursos de aprendizaje y progreso básico de estudiantes mediante una arquitectura basada en microservicios utilizando Java y Python.

---

# Objetivo del proyecto

El objetivo principal es implementar una arquitectura distribuida que demuestre:

- Uso de microservicios
- Comunicación REST
- Comunicación mediante colas
- Integración entre Java y Python
- Uso de hilos
- Procesamiento asíncrono
- Contenedores Docker
- Orquestación básica de servicios

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
        |---- RabbitMQ ---> recommendation-worker (Python)
```

---

# Tecnologías utilizadas

## Backend

- Java 17
- Spring Boot
- Python
- FastAPI

---

## Comunicación distribuida

- RabbitMQ
- API REST

---

## Base de datos

- PostgreSQL

---

## Infraestructura

- Docker
- Docker Compose

---

## Herramientas

- Git
- GitHub
- Postman
- VS Code

---

# Estructura del proyecto

```text
academic-platform-distributed/
│
├── database/
│   └── init.sql
│
├── docs/
│   ├── architecture.md
│   └── demo-flow.md
│
├── postman/
│   └── collection.json
│
├── docker-compose.yml
│
└── README.md
```

---

# Componentes del sistema

## academic-service

Microservicio principal desarrollado en Java con Spring Boot.

Responsabilidades:

- Consultar materias
- Consultar cursos
- Consultar recursos
- Registrar progreso académico
- Publicar eventos en RabbitMQ

---

## recommendation-service

Microservicio desarrollado en Python.

Responsabilidades:

- Generar recomendaciones académicas
- Exponer endpoints REST

---

## recommendation-worker

Worker desarrollado en Python.

Responsabilidades:

- Consumir mensajes desde RabbitMQ
- Procesar eventos académicos
- Generar recomendaciones automáticas

---

# Comunicación REST

```text
academic-service ---> recommendation-service
```

Se utiliza para consultar recomendaciones académicas.

Ejemplo conceptual:

```text
GET /recommendations/{studentId}
```

---

# Comunicación mediante colas

```text
academic-service ---> RabbitMQ ---> recommendation-worker
```

Evento principal:

```text
RESOURCE_COMPLETED
```

---

# Configuración RabbitMQ

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

# Base de datos PostgreSQL

## Base de datos

```text
academic_platform
```

## Usuario

```text
postgres
```

## Contraseña

```text
postgres
```

---

# Tablas principales

- subjects
- courses
- resources
- student_progress
- activity_log

---

# Infraestructura Docker

Servicios configurados:

| Servicio | Puerto |
|---|---|
| PostgreSQL | 5432 |
| RabbitMQ | 5672 |
| RabbitMQ Management | 15672 |

---

# Levantar el proyecto

## 1. Clonar repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
```

Entrar al proyecto:

```bash
cd academic-platform-distributed
```

---

## 2. Levantar infraestructura

```bash
docker compose up -d
```

---

## 3. Verificar contenedores

```bash
docker ps
```

---

# Acceso RabbitMQ

Abrir en navegador:

```text
http://localhost:15672
```

## Credenciales

Usuario:

```text
guest
```

Contraseña:

```text
guest
```

---

# Flujo principal del sistema

```text
1. Estudiante completa recurso
2. Java registra progreso
3. Java publica evento RESOURCE_COMPLETED
4. RabbitMQ recibe el mensaje
5. Python consume el evento
6. Python genera recomendaciones
```

---

# Colección Postman

La colección de pruebas se encuentra en:

```text
postman/collection.json
```

Incluye endpoints para:

- Health Check
- Subjects
- Complete Resource
- Recommendations

---

# Documentación adicional

## Arquitectura

```text
docs/architecture.md
```

---

## Flujo distribuido

```text
docs/demo-flow.md
```




---

# Estado actual

Actualmente el proyecto cuenta con:

- Infraestructura Docker funcional
- PostgreSQL funcional
- RabbitMQ funcional
- Base de datos inicial
- Arquitectura documentada
- Flujo distribuido documentado
- Colección Postman
- Configuración inicial distribuida

---

# Objetivos distribuidos demostrados

El proyecto demuestra:

- Arquitectura distribuida
- Comunicación síncrona y asíncrona
- Integración entre tecnologías
- Uso de sistemas de colas
- Uso de hilos
- Microservicios
- Contenedores Docker
- Procesamiento desacoplado