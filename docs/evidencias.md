# Integrante 5: Celeste - Despliegue HTTPS y Evidencias

## 1. Descripción del trabajo

En este módulo se realizó el despliegue del sistema web utilizando Docker y su exposición a internet mediante Cloudflare Tunnel, con el objetivo de simular un entorno de producción real con acceso seguro vía HTTPS.

El trabajo se centró en la configuración del punto de entrada del sistema (frontend) y su publicación externa, cumpliendo con los requisitos de conectividad segura definidos en el proyecto.

---

## 2. URL pública del sistema

https://captain-assets-jet-sorry.trycloudflare.com

---

## 3. Despliegue realizado

El sistema fue ejecutado localmente utilizando Docker Compose, permitiendo levantar todos los servicios del sistema de forma integrada:

- Frontend (Vite + Node.js)
- API Gateway
- Microservicios backend
- Base de datos PostgreSQL
- Servicio de mensajería RabbitMQ
- Servicio de autenticación (Keycloak)

Posteriormente, el frontend fue expuesto a internet mediante Cloudflare Tunnel, generando una URL pública accesible desde cualquier navegador.

---

## 4. Seguridad (HTTPS)

La conexión pública utiliza HTTPS proporcionado automáticamente por Cloudflare Tunnel, lo que garantiza:

- Comunicación cifrada entre cliente y servidor  
- Certificado SSL válido emitido por Cloudflare  
- Acceso seguro desde navegadores modernos  
- Indicador de conexión segura (candado )

---

## 5. Comando utilizado


cloudflared tunnel --url http://localhost:5173

## Evidencias visuales


### Frontend local


### Cloudflare Tunnel


### URL pública


### HTTPS
