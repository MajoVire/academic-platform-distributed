# Despliegue HTTPS y evidencias

## 1. Objetivo

Este documento resume la exposición segura del frontend mediante Cloudflare Tunnel y deja registradas las URLs, comandos y capturas usadas para la demo.

La idea es simular un entorno de producción con acceso público por HTTPS sin alterar la arquitectura interna del sistema distribuido.

---

## 2. URL pública de la demo

URL pública capturada en la sesión de prueba:

```text
https://captain-assets-jet-sorry.trycloudflare.com
```

Nota:

- Las URLs de `trycloudflare.com` pueden rotar entre sesiones.
- Si se recrea el túnel, conviene actualizar este documento con la nueva URL pública.

---

## 3. URLs locales verificadas

Estas son las direcciones usadas durante la ejecución local del sistema:

- Frontend: `http://localhost:5173`
- API Gateway: `http://localhost:3000`
- academic-service: `http://localhost:8080`
- recommendation-service: `http://localhost:8000`
- Keycloak: `http://localhost:8180`
- RabbitMQ Management: `http://localhost:15672`

---

## 4. Comandos utilizados

Levantamiento del sistema:

```bash
docker compose up --build
```

Publicación del frontend por Cloudflare Tunnel:

```bash
cloudflared tunnel --url http://localhost:5173
```

Validaciones rápidas recomendadas:

```bash
curl http://localhost:5173
curl http://localhost:3000/api/health
curl http://localhost:8080/api/subjects
curl http://localhost:8000/health
```

---

## 5. Variables de producción sugeridas

Las siguientes variables ayudan a preparar el despliegue público o una capa de reverse proxy HTTPS:

| Variable | Valor sugerido |
|---|---|
| `NODE_ENV` | `production` |
| `GATEWAY_CORS_ORIGIN` | `https://<tu-dominio-publico>` |
| `VITE_API_BASE_URL` | `https://<tu-dominio-publico>` |
| `VITE_GATEWAY_URL` | `https://<tu-dominio-publico>` |
| `VITE_KEYCLOAK_URL` | `https://<tu-keycloak-publico>` |
| `KEYCLOAK_ISSUER_URI` | `https://<tu-keycloak-publico>/realms/academic-platform` |
| `KEYCLOAK_JWK_SET_URI` | `https://<tu-keycloak-publico>/realms/academic-platform/protocol/openid-connect/certs` |

Variables que normalmente se mantienen internas dentro de Docker:

- `ACADEMIC_SERVICE_URL=http://academic-service:8080`
- `RECOMMENDATION_SERVICE_URL=http://recommendation-service:8000`

---

## 6. Evidencias visuales

### Frontend local

![Frontend local](./imgs/Fronted%20Local.png)

### Cloudflare Tunnel activo

![Terminal con Cloudflare Tunnel activo](./imgs/Terminal%20con%20Cloudflare%20tunel%20activo.png)

### URL pública funcionando

![URL pública funcionando](./imgs/Url%20publica%20funcionando.png)

### Conexión HTTPS

![Candado de seguridad HTTPS](./imgs/candado%20de%20seguridad.png)

---

## 7. Observaciones para la demo

- El túnel de Cloudflare sirve como capa HTTPS para publicar el frontend.
- Si se desea exponer también gateway, Keycloak o un reverse proxy completo, las variables de producción deben alinearse con la URL pública final.
- Para la entrega académica, este documento sirve como evidencia de acceso público seguro y de los comandos ejecutados.
