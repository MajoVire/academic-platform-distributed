FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=http://localhost:3000
ARG VITE_GATEWAY_URL=http://localhost:3000
ARG VITE_KEYCLOAK_URL=http://localhost:8180
ARG VITE_KEYCLOAK_REALM=academic-platform
ARG VITE_KEYCLOAK_CLIENT_ID=academic-frontend

# Vite toma estas variables durante el build y las incrusta en el bundle final.
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    VITE_GATEWAY_URL=${VITE_GATEWAY_URL} \
    VITE_KEYCLOAK_URL=${VITE_KEYCLOAK_URL} \
    VITE_KEYCLOAK_REALM=${VITE_KEYCLOAK_REALM} \
    VITE_KEYCLOAK_CLIENT_ID=${VITE_KEYCLOAK_CLIENT_ID}

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=build /app /app

EXPOSE 5173

# Se usa preview para servir el bundle compilado sin volver a depender de env runtime.
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173", "--strictPort"]
