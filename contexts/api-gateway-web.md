Necesito que analices este repositorio antes de hacer cualquier cambio.

Contexto general del proyecto:
Este proyecto corresponde a una plataforma web académica complementaria para estudiantes de la carrera de Computación. La plataforma permitirá consultar materias, cursos complementarios, recursos de aprendizaje, progreso básico del estudiante y recomendaciones académicas.

El proyecto se está trabajando para dos asignaturas:
1. Sistemas Distribuidos: backend, microservicios, comunicación entre servicios, colas, hilos, Docker.
2. Programación Web: frontend, diseño responsivo, consumo de backend o mock, PWA.

Actualmente se quiere reutilizar lo ya planteado para el proyecto final, pero también cumplir una tarea específica de Programación Web que pide:
- Programar con 3 tecnologías backend diferentes.
- Que estas tecnologías backend se comuniquen entre ellas.
- Que exista comunicación con algún frontend.

Arquitectura backend planteada originalmente:
1. academic-service
   - Tecnología: Java + Spring Boot.
   - Función: gestionar materias, cursos complementarios, recursos de aprendizaje y progreso del estudiante.
   - Debe usar hilos para procesar tareas concurrentes.
   - Debe publicar eventos hacia RabbitMQ cuando un estudiante complete un recurso.
   - Debe comunicarse por REST con el servicio Python de recomendaciones.

2. recommendation-service
   - Tecnología: Python + FastAPI.
   - Función: exponer recomendaciones académicas mediante REST.

3. recommendation-worker
   - Tecnología: Python.
   - Función: consumir eventos desde RabbitMQ y generar recomendaciones.

4. RabbitMQ
   - Función: sistema de colas para eventos académicos.

5. PostgreSQL
   - Función: persistencia de datos principales.

6. Docker / Docker Compose
   - Función: levantar los servicios del entorno local.

Nuevo ajuste para cumplir la tarea de 3 tecnologías backend:
Se propone agregar un tercer backend llamado web-gateway-service.

Este servicio debe ser:
- Tecnología: Node.js + Express + TypeScript.
- Función: actuar como API Gateway o Backend for Frontend.
- Debe recibir peticiones del frontend.
- Debe comunicarse por REST con academic-service.
- Debe comunicarse por REST con recommendation-service cuando corresponda.
- Debe unificar la comunicación del frontend con los microservicios backend.

Arquitectura esperada con el nuevo servicio:

Frontend React
   |
   v
web-gateway-service
Node.js + Express + TypeScript
   |
   |-- REST --> academic-service
   |             Java + Spring Boot
   |
   |-- REST --> recommendation-service
                 Python + FastAPI

Además, el flujo distribuido interno se mantiene así:

academic-service
   |
   |-- publica evento
   v
RabbitMQ
   |
   v
recommendation-worker
Python

Flujo funcional principal:
1. El estudiante entra al frontend.
2. El frontend solicita materias al web-gateway-service.
3. El web-gateway-service consulta al academic-service.
4. El academic-service responde con materias, cursos o recursos.
5. El estudiante marca un recurso como completado desde el frontend.
6. El frontend envía la solicitud al web-gateway-service.
7. El web-gateway-service reenvía la solicitud al academic-service.
8. El academic-service registra el progreso, usa hilos y publica un evento en RabbitMQ.
9. El recommendation-worker procesa el evento.
10. El recommendation-service permite consultar recomendaciones.
11. El frontend consulta recomendaciones mediante el web-gateway-service.

Endpoints esperados a nivel de gateway:
GET  /api/health
GET  /api/subjects
GET  /api/subjects/:subjectId/courses
GET  /api/courses/:courseId/resources
POST /api/students/:studentId/resources/:resourceId/complete
GET  /api/students/:studentId/progress
GET  /api/students/:studentId/recommendations

Estos endpoints del gateway deberían mapearse internamente hacia los servicios correspondientes.

Endpoints esperados del academic-service:
GET  /api/subjects
GET  /api/subjects/{subjectId}/courses
GET  /api/courses/{courseId}/resources
POST /api/students/{studentId}/resources/{resourceId}/complete
GET  /api/students/{studentId}/progress
GET  /api/health

Endpoint esperado del recommendation-service:
GET /recommendations/{studentId}

Frontend:
Existe o existirá un frontend separado o dentro del monorepo usando:
- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- PWA

El frontend debe consumir preferentemente el web-gateway-service, no directamente todos los microservicios.

Objetivo actual:
Por ahora NO implementes nada.
Solo analiza la estructura actual del repositorio.

Necesito que identifiques:
1. Qué carpetas existen actualmente en el monorepo.
2. Qué componentes backend ya están creados.
3. Si existe frontend dentro del monorepo o si aparentemente está separado.
4. Si existe academic-service y qué estructura tiene.
5. Si existe recommendation-service y qué estructura tiene.
6. Si existe recommendation-worker y qué estructura tiene.
7. Si existe docker-compose.yml y qué servicios declara.
8. Si existe alguna carpeta o configuración relacionada con frontend.
9. Si existe o no web-gateway-service.
10. Qué cambios serían necesarios para agregar web-gateway-service sin romper lo existente.
11. Qué riesgos de integración ves entre frontend, gateway, academic-service y recommendation-service.
12. Qué plan de implementación propones por pasos, pero sin aplicar cambios todavía.

Restricciones importantes:
- No modifiques archivos todavía.
- No crees archivos todavía.
- No elimines archivos.
- No hagas commits.
- No ejecutes cambios destructivos.
- Solo analiza y reporta.
- Si necesitas ejecutar comandos, usa solo comandos de inspección como:
  - ls
  - tree
  - find
  - cat
  - grep
  - git status
  - git branch
  - git log --oneline
- No instales dependencias todavía.
- No inicialices proyectos todavía.
- No modifiques docker-compose.yml todavía.

También necesito que al final me entregues:
1. Resumen de la estructura encontrada.
2. Diagnóstico de qué falta.
3. Propuesta clara para integrar web-gateway-service.
4. Recomendación de dónde debería ubicarse el frontend si está dentro o fuera del monorepo.
5. Siguiente prompt recomendado para empezar la implementación después del análisis.