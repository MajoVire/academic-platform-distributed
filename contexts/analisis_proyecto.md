Necesito que realices únicamente un análisis técnico del repositorio antes de modificar cualquier archivo.

Contexto del proyecto:
Es una plataforma web académica complementaria construida con arquitectura distribuida. Actualmente incluye, entre otros componentes:

- academic-service en Java con Spring Boot
- recommendation-service en Python con FastAPI
- recommendation-worker en Python
- RabbitMQ
- PostgreSQL
- web-gateway-service
- frontend
- Dockerfiles por servicio
- docker-compose.yml
- configuración por variables de entorno

La nueva entrega corresponde a la responsabilidad del Integrante 3 y debe cubrir:

- Kubernetes
- Deployments
- Services
- ConfigMaps
- Secrets
- requests y limits
- HorizontalPodAutoscaler para recommendation-worker
- prueba de carga
- documentación del despliegue y escalado

El flujo distribuido esperado es:

Cliente REST
→ API Gateway
→ academic-service
→ RabbitMQ
→ recommendation-worker
→ notificador o web-gateway-service
→ WebSocket
→ frontend

Objetivo de esta fase:
Antes de implementar, debes comprender completamente el estado actual del repositorio y producir un diagnóstico técnico.

Instrucciones obligatorias:

1. No crees, elimines ni modifiques archivos.
2. No ejecutes refactorizaciones.
3. No generes todavía manifiestos Kubernetes.
4. No asumas nombres, puertos, variables, endpoints o dependencias.
5. Basa el análisis únicamente en el contenido real del repositorio.

Analiza específicamente:

1. Estructura completa del repositorio
   - servicios existentes
   - carpetas principales
   - archivos de configuración
   - scripts
   - documentación existente

2. docker-compose.yml
   - servicios definidos
   - nombres internos
   - imágenes y contextos de build
   - puertos
   - variables de entorno
   - volúmenes
   - healthchecks
   - depends_on
   - redes
   - dependencias entre servicios

3. Dockerfiles
   - academic-service
   - recommendation-service
   - recommendation-worker
   - web-gateway-service
   - frontend
   - notification-service, si existe
   - imagen base
   - comando de inicio
   - puerto interno
   - rutas de build
   - archivos copiados

4. Configuración de cada servicio
   - variables de entorno requeridas
   - archivos application.yml, application.properties o equivalentes
   - configuración de PostgreSQL
   - configuración de RabbitMQ
   - configuración REST
   - configuración WebSocket
   - endpoints de healthcheck

5. Comunicación entre componentes
   - cómo academic-service se comunica con PostgreSQL
   - cómo academic-service publica en RabbitMQ
   - exchange, queue y routing keys reales
   - cómo recommendation-worker consume eventos
   - si recommendation-worker publica un evento de resultado
   - cómo recommendation-service almacena o expone recomendaciones
   - cómo web-gateway-service se comunica con los demás servicios
   - si existe WebSocket actualmente
   - si existe notification-service o si la notificación está integrada en el gateway

6. Persistencia
   - esquema de PostgreSQL
   - scripts de inicialización
   - tablas utilizadas por cada servicio
   - volúmenes necesarios
   - consideraciones para Kubernetes

7. Preparación para Kubernetes
   - qué servicios requieren Deployment
   - qué componentes requieren Service
   - qué servicios necesitan almacenamiento persistente
   - qué variables deben ir en ConfigMap
   - qué valores deben ir en Secret
   - qué healthchecks pueden convertirse en readinessProbe y livenessProbe
   - qué puertos deben exponerse
   - qué imágenes deberán construirse
   - qué nombres DNS internos deberán usarse

8. HPA y prueba de carga
   - verifica si recommendation-worker consume CPU suficiente para demostrar HPA
   - identifica si el worker puede tener múltiples réplicas
   - analiza si hay riesgos de procesamiento duplicado
   - identifica métricas disponibles
   - confirma si el clúster necesitará Metrics Server
   - determina qué endpoint o flujo puede usarse para generar carga
   - revisa si existe ya algún script de carga

9. Inconsistencias o bloqueos
   - puertos contradictorios
   - variables con nombres diferentes entre Docker Compose y código
   - dependencias no declaradas
   - servicios que usan localhost dentro de contenedores
   - healthchecks inexistentes
   - imágenes que no pueden construirse desde el contexto actual
   - uso de almacenamiento en memoria que no funcione con múltiples réplicas
   - servicios faltantes
   - decisiones pendientes entre notification-service y web-gateway-service

Entrega únicamente un informe de análisis con esta estructura:

A. Resumen de la arquitectura actual

B. Inventario de servicios
Para cada servicio indica:
- tecnología
- responsabilidad
- puerto
- comando de inicio
- dependencias
- variables de entorno
- persistencia
- healthcheck

C. Flujo actual entre servicios

D. Estado actual respecto a los requisitos del Integrante 3
Clasifica cada requisito como:
- ya implementado
- parcialmente implementado
- no implementado
- bloqueado por otra decisión

E. Hallazgos e inconsistencias

F. Decisiones que deben confirmarse antes de implementar

G. Archivos que probablemente deberán crearse

H. Archivos existentes que probablemente deberán modificarse

I. Plan de implementación por fases

J. Riesgos técnicos

K. Criterios de aceptación para:
- despliegue Kubernetes
- ConfigMaps y Secrets
- requests y limits
- HPA
- prueba de carga
- documentación

Al final incluye una tabla con:

- componente
- estado actual
- cambio necesario
- dependencia
- prioridad

No implementes nada todavía. Detente después de entregar el análisis y espera aprobación explícita antes de escribir código.