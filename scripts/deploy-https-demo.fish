#!/usr/bin/env fish

# Despliegue HTTPS temporal para Academic Platform:
# - Opcionalmente reconstruye servicios propios con tags inmutables.
# - Levanta port-forward para frontend, gateway y Keycloak.
# - Crea 3 Cloudflare Quick Tunnels.
# - Captura y relaciona automáticamente las URLs.
# - Configura CORS, hostname/redirects de Keycloak y variables Vite.
# - Reconstruye y despliega el frontend.
#
# Uso:
#   ./scripts/deploy-https-demo.fish
#   ./scripts/deploy-https-demo.fish --all
#   ./scripts/deploy-https-demo.fish --stop

set -g NAMESPACE "academic-platform"
set -g REALM "academic-platform"
set -g KEYCLOAK_CLIENT_ID "academic-frontend"

set -g SCRIPT_DIR (cd (dirname (status filename)); and pwd)
set -g PROJECT_ROOT (cd "$SCRIPT_DIR/.."; and pwd)
set -g STATE_DIR "$PROJECT_ROOT/.demo/https"
set -g LOG_DIR "$STATE_DIR/logs"
set -g PID_FILE "$STATE_DIR/pids.env"
set -g URL_FILE "$STATE_DIR/https-urls.env"

set -g FRONTEND_PORT 5173
set -g GATEWAY_PORT 3000
set -g KEYCLOAK_PORT 8180

set -g REBUILD_ALL 0
set -g ORIGINAL_ENV_EXISTS 0
set -g FRONTEND_ENV "$PROJECT_ROOT/frontend/.env.production.local"
set -g FRONTEND_ENV_BACKUP "$STATE_DIR/.env.production.local.backup"

function info
    echo (set_color cyan)"[INFO]"(set_color normal) $argv
end

function ok
    echo (set_color green)"[OK]"(set_color normal) $argv
end

function warn
    echo (set_color yellow)"[AVISO]"(set_color normal) $argv
end

function fail
    echo (set_color red)"[ERROR]"(set_color normal) $argv >&2
    exit 1
end

function require_command
    command -q $argv[1]; or fail "No está instalado el comando: $argv[1]"
end

function wait_local_url
    set -l url $argv[1]
    set -l name $argv[2]
    set -l attempts 40

    for i in (seq 1 $attempts)
        if curl -fsS --max-time 3 "$url" >/dev/null 2>&1
            ok "$name responde en $url"
            return 0
        end
        sleep 1
    end

    fail "$name no respondió en $url"
end

function wait_tunnel_url
    set -l log_file $argv[1]
    set -l name $argv[2]
    set -l attempts 60

    for i in (seq 1 $attempts)
        set -l url (grep -Eo 'https://[a-z0-9-]+\.trycloudflare\.com' "$log_file" 2>/dev/null | head -n 1)
        if test -n "$url"
            echo "$url"
            return 0
        end
        sleep 1
    end

    echo
    fail "No se pudo obtener la URL del túnel $name. Revisa $log_file"
end

function process_alive
    set -l pid $argv[1]
    kill -0 $pid >/dev/null 2>&1
end

function start_port_forward
    set -l service $argv[1]
    set -l mapping $argv[2]
    set -l log_file "$LOG_DIR/port-forward-$service.log"

    nohup kubectl port-forward "service/$service" \
        -n "$NAMESPACE" "$mapping" \
        >"$log_file" 2>&1 &

    set -l pid $last_pid
    echo "$pid"
end

function start_tunnel
    set -l name $argv[1]
    set -l port $argv[2]
    set -l log_file "$LOG_DIR/cloudflared-$name.log"

    nohup cloudflared tunnel --no-autoupdate \
        --url "http://127.0.0.1:$port" \
        >"$log_file" 2>&1 &

    set -l pid $last_pid
    echo "$pid"
end

function stop_previous
    if not test -f "$PID_FILE"
        return 0
    end

    info "Deteniendo procesos anteriores registrados..."

    for line in (cat "$PID_FILE")
        set -l parts (string split "=" "$line")
        if test (count $parts) -eq 2
            set -l pid $parts[2]
            if string match -rq '^[0-9]+$' "$pid"; and process_alive "$pid"
                kill "$pid" >/dev/null 2>&1
            end
        end
    end

    rm -f "$PID_FILE"
    sleep 1
end

function restore_frontend_env --on-event fish_exit
    if test "$ORIGINAL_ENV_EXISTS" = "1"; and test -f "$FRONTEND_ENV_BACKUP"
        cp "$FRONTEND_ENV_BACKUP" "$FRONTEND_ENV"
    else if test "$ORIGINAL_ENV_EXISTS" = "0"
        rm -f "$FRONTEND_ENV"
    end
end

function deployment_container
    kubectl get deployment "$argv[1]" \
        -n "$NAMESPACE" \
        -o jsonpath='{.spec.template.spec.containers[0].name}'
end

function deploy_image
    set -l deployment $argv[1]
    set -l image $argv[2]
    set -l container (deployment_container "$deployment")

    test -n "$container"; or fail "No se encontró el contenedor de $deployment"

    kubectl set image "deployment/$deployment" \
        "$container=$image" \
        -n "$NAMESPACE" >/dev/null

    kubectl rollout status "deployment/$deployment" \
        -n "$NAMESPACE" \
        --timeout=300s
end

function build_optional_services
    if test "$REBUILD_ALL" != "1"
        return 0
    end

    info "Reconstruyendo servicios propios con tag $TAG"

    docker build --no-cache \
        -t "academic-platform/academic-service:$TAG" \
        "$PROJECT_ROOT/academic-service"; or fail "Falló academic-service"

    docker build --no-cache \
        -t "academic-platform/recommendation-service:$TAG" \
        "$PROJECT_ROOT/recommendation-service"; or fail "Falló recommendation-service"

    docker build --no-cache \
        -f "$PROJECT_ROOT/recommendation-worker/Dockerfile" \
        -t "academic-platform/recommendation-worker:$TAG" \
        "$PROJECT_ROOT"; or fail "Falló recommendation-worker"

    docker build --no-cache \
        -t "academic-platform/web-gateway-service:$TAG" \
        "$PROJECT_ROOT/web-gateway-service"; or fail "Falló web-gateway-service"

    deploy_image academic-service \
        "academic-platform/academic-service:$TAG"; or fail "Falló el despliegue de academic-service"

    deploy_image recommendation-service \
        "academic-platform/recommendation-service:$TAG"; or fail "Falló el despliegue de recommendation-service"

    deploy_image recommendation-worker \
        "academic-platform/recommendation-worker:$TAG"; or fail "Falló el despliegue de recommendation-worker"

    deploy_image web-gateway-service \
        "academic-platform/web-gateway-service:$TAG"; or fail "Falló el despliegue de web-gateway-service"

    ok "Servicios backend reconstruidos y desplegados"
end

function configure_keycloak
    info "Configurando Keycloak para $FRONTEND_URL"

    set -l kc_admin (kubectl exec deployment/keycloak -n "$NAMESPACE" -- \
        printenv KEYCLOAK_ADMIN 2>/dev/null | string trim)

    set -l kc_password (kubectl exec deployment/keycloak -n "$NAMESPACE" -- \
        printenv KEYCLOAK_ADMIN_PASSWORD 2>/dev/null | string trim)

    test -n "$kc_admin"; or fail "KEYCLOAK_ADMIN no está disponible en el pod"
    test -n "$kc_password"; or fail "KEYCLOAK_ADMIN_PASSWORD no está disponible en el pod"

    kubectl exec deployment/keycloak -n "$NAMESPACE" -- \
        /opt/keycloak/bin/kcadm.sh config credentials \
        --server http://localhost:8080 \
        --realm master \
        --user "$kc_admin" \
        --password "$kc_password" >/dev/null; or fail "No se pudo autenticar kcadm"

    set -l client_uuid (kubectl exec deployment/keycloak -n "$NAMESPACE" -- \
        /opt/keycloak/bin/kcadm.sh get clients \
        -r "$REALM" \
        -q "clientId=$KEYCLOAK_CLIENT_ID" \
        --fields id \
        --format csv \
        --noquotes 2>/dev/null | head -n 1 | string trim)

    test -n "$client_uuid"; or fail "No se encontró el cliente $KEYCLOAK_CLIENT_ID"

    kubectl exec deployment/keycloak -n "$NAMESPACE" -- \
        /opt/keycloak/bin/kcadm.sh update "clients/$client_uuid" \
        -r "$REALM" \
        -s "rootUrl=$FRONTEND_URL" \
        -s "baseUrl=$FRONTEND_URL" \
        -s "redirectUris=[\"$FRONTEND_URL/*\"]" \
        -s "webOrigins=[\"$FRONTEND_URL\"]" \
        -s "attributes.\"post.logout.redirect.uris\"=\"$FRONTEND_URL/*\"" \
        >/dev/null; or fail "No se pudo actualizar el cliente de Keycloak"

    ok "Redirect URIs y Web Origins actualizados"
end

function validate_unique_urls
    test "$FRONTEND_URL" != "$GATEWAY_URL"; or fail "Frontend y gateway recibieron la misma URL"
    test "$FRONTEND_URL" != "$KEYCLOAK_URL"; or fail "Frontend y Keycloak recibieron la misma URL"
    test "$GATEWAY_URL" != "$KEYCLOAK_URL"; or fail "Gateway y Keycloak recibieron la misma URL"

    for url in "$FRONTEND_URL" "$GATEWAY_URL" "$KEYCLOAK_URL"
        string match -rq '^https://[a-z0-9-]+\.trycloudflare\.com$' "$url"; or \
            fail "URL de Cloudflare inválida: $url"
    end
end

# Argumentos
for arg in $argv
    switch "$arg"
        case --all
            set -g REBUILD_ALL 1
        case --stop
            mkdir -p "$STATE_DIR"
            stop_previous
            ok "Túneles y port-forward detenidos"
            exit 0
        case '*'
            fail "Argumento no reconocido: $arg"
    end
end

cd "$PROJECT_ROOT"; or fail "No se pudo abrir $PROJECT_ROOT"
mkdir -p "$LOG_DIR"

require_command kubectl
require_command minikube
require_command docker
require_command cloudflared
require_command curl
require_command grep
require_command git

minikube status >/dev/null; or fail "Minikube no está iniciado"
kubectl get namespace "$NAMESPACE" >/dev/null 2>&1; or fail "No existe el namespace $NAMESPACE"

for svc in frontend web-gateway-service keycloak
    kubectl get service "$svc" -n "$NAMESPACE" >/dev/null 2>&1; or \
        fail "No existe el Service $svc"
end

set -g GIT_SHA (git rev-parse --short HEAD)
set -g TAG "demo-$GIT_SHA-"(date +%Y%m%d%H%M%S)

info "Usando Docker interno de Minikube"
minikube docker-env --shell fish | source; or fail "No se pudo cargar docker-env de Minikube"

# Las versiones backend se construyen antes de generar las URLs públicas.
build_optional_services

stop_previous
rm -f "$LOG_DIR"/*.log

info "Levantando port-forward iniciales..."
set -g PF_FRONTEND_PID (start_port_forward frontend "$FRONTEND_PORT:5173")
set -g PF_GATEWAY_PID (start_port_forward web-gateway-service "$GATEWAY_PORT:3000")
set -g PF_KEYCLOAK_PID (start_port_forward keycloak "$KEYCLOAK_PORT:8080")

wait_local_url "http://127.0.0.1:$FRONTEND_PORT" "Frontend"
wait_local_url "http://127.0.0.1:$GATEWAY_PORT/health" "Gateway"
wait_local_url "http://127.0.0.1:$KEYCLOAK_PORT/realms/$REALM/.well-known/openid-configuration" "Keycloak"

info "Creando Cloudflare Quick Tunnels..."
set -g TUNNEL_FRONTEND_PID (start_tunnel frontend "$FRONTEND_PORT")
set -g TUNNEL_GATEWAY_PID (start_tunnel gateway "$GATEWAY_PORT")
set -g TUNNEL_KEYCLOAK_PID (start_tunnel keycloak "$KEYCLOAK_PORT")

set -g FRONTEND_URL (wait_tunnel_url "$LOG_DIR/cloudflared-frontend.log" "frontend")
set -g GATEWAY_URL (wait_tunnel_url "$LOG_DIR/cloudflared-gateway.log" "gateway")
set -g KEYCLOAK_URL (wait_tunnel_url "$LOG_DIR/cloudflared-keycloak.log" "Keycloak")

validate_unique_urls

printf '%s\n' \
    "PUBLIC_FRONTEND_URL=$FRONTEND_URL" \
    "PUBLIC_GATEWAY_URL=$GATEWAY_URL" \
    "PUBLIC_KEYCLOAK_URL=$KEYCLOAK_URL" \
    "VITE_API_BASE_URL=$GATEWAY_URL/api" \
    "VITE_GATEWAY_URL=$GATEWAY_URL" \
    "VITE_KEYCLOAK_URL=$KEYCLOAK_URL" \
    "VITE_KEYCLOAK_REALM=$REALM" \
    "VITE_KEYCLOAK_CLIENT_ID=$KEYCLOAK_CLIENT_ID" \
    "DEPLOY_TAG=$TAG" \
    > "$URL_FILE"

info "Actualizando CORS del gateway..."
kubectl set env deployment/web-gateway-service \
    -n "$NAMESPACE" \
    "GATEWAY_CORS_ORIGIN=$FRONTEND_URL" >/dev/null; or fail "No se pudo actualizar CORS"

kubectl rollout status deployment/web-gateway-service \
    -n "$NAMESPACE" \
    --timeout=300s; or fail "Falló rollout del gateway"

# El rollout anterior suele cerrar el port-forward previo.
if process_alive "$PF_GATEWAY_PID"
    kill "$PF_GATEWAY_PID" >/dev/null 2>&1
end
set -g PF_GATEWAY_PID (start_port_forward web-gateway-service "$GATEWAY_PORT:3000")
wait_local_url "http://127.0.0.1:$GATEWAY_PORT/health" "Gateway reiniciado"

configure_keycloak

# Configura el hostname público para que los metadatos OIDC no anuncien localhost.
kubectl set env deployment/keycloak \
    -n "$NAMESPACE" \
    "KC_HOSTNAME=$KEYCLOAK_URL" \
    "KC_PROXY_HEADERS=xforwarded" \
    "KC_HTTP_ENABLED=true" >/dev/null; or fail "No se pudo actualizar el hostname de Keycloak"

kubectl rollout status deployment/keycloak \
    -n "$NAMESPACE" \
    --timeout=300s; or fail "Falló rollout de Keycloak"

if process_alive "$PF_KEYCLOAK_PID"
    kill "$PF_KEYCLOAK_PID" >/dev/null 2>&1
end
set -g PF_KEYCLOAK_PID (start_port_forward keycloak "$KEYCLOAK_PORT:8080")
wait_local_url "http://127.0.0.1:$KEYCLOAK_PORT/realms/$REALM/.well-known/openid-configuration" "Keycloak reiniciado"

# Respaldar la configuración local del frontend.
if test -f "$FRONTEND_ENV"
    set -g ORIGINAL_ENV_EXISTS 1
    cp "$FRONTEND_ENV" "$FRONTEND_ENV_BACKUP"
else
    set -g ORIGINAL_ENV_EXISTS 0
end

printf '%s\n' \
    "VITE_API_BASE_URL=$GATEWAY_URL/api" \
    "VITE_GATEWAY_URL=$GATEWAY_URL" \
    "VITE_KEYCLOAK_URL=$KEYCLOAK_URL" \
    "VITE_KEYCLOAK_REALM=$REALM" \
    "VITE_KEYCLOAK_CLIENT_ID=$KEYCLOAK_CLIENT_ID" \
    > "$FRONTEND_ENV"

info "Construyendo frontend con URLs HTTPS..."
docker build --no-cache \
    -t "academic-platform/frontend:$TAG" \
    "$PROJECT_ROOT/frontend"; or fail "Falló la construcción del frontend"

deploy_image frontend "academic-platform/frontend:$TAG"; or fail "Falló el despliegue del frontend"

if process_alive "$PF_FRONTEND_PID"
    kill "$PF_FRONTEND_PID" >/dev/null 2>&1
end
set -g PF_FRONTEND_PID (start_port_forward frontend "$FRONTEND_PORT:5173")
wait_local_url "http://127.0.0.1:$FRONTEND_PORT" "Frontend reiniciado"

# Persistir PIDs finales.
printf '%s\n' \
    "PF_FRONTEND_PID=$PF_FRONTEND_PID" \
    "PF_GATEWAY_PID=$PF_GATEWAY_PID" \
    "PF_KEYCLOAK_PID=$PF_KEYCLOAK_PID" \
    "TUNNEL_FRONTEND_PID=$TUNNEL_FRONTEND_PID" \
    "TUNNEL_GATEWAY_PID=$TUNNEL_GATEWAY_PID" \
    "TUNNEL_KEYCLOAK_PID=$TUNNEL_KEYCLOAK_PID" \
    > "$PID_FILE"

info "Validando URLs públicas..."
curl -fsS --retry 8 --retry-delay 2 \
    "$GATEWAY_URL/health" >/dev/null; or fail "Gateway HTTPS no responde"

curl -fsS --retry 8 --retry-delay 2 \
    "$KEYCLOAK_URL/realms/$REALM/.well-known/openid-configuration" >/dev/null; or \
    fail "Keycloak HTTPS no responde"

curl -fsS --retry 8 --retry-delay 2 \
    "$FRONTEND_URL" >/dev/null; or fail "Frontend HTTPS no responde"

echo
echo (set_color green)"════════════════ DESPLIEGUE HTTPS LISTO ════════════════"(set_color normal)
printf "Frontend : %s\n" "$FRONTEND_URL"
printf "Gateway  : %s\n" "$GATEWAY_URL"
printf "Keycloak : %s\n" "$KEYCLOAK_URL"
printf "Tag       : %s\n" "$TAG"
printf "URLs      : %s\n" "$URL_FILE"
printf "Logs      : %s\n" "$LOG_DIR"
echo
echo "Para detener todo:"
echo "  ./scripts/deploy-https-demo.fish --stop"
echo "════════════════════════════════════════════════════════"
