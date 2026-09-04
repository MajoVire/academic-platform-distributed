#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="${1:-$(pwd)}"
DOCKERFILE="$ROOT/frontend/Dockerfile"
DEPLOY_SCRIPT="$ROOT/scripts/deploy-single-tunnel-demo.sh"

fail() { echo "[ERROR] $*" >&2; exit 1; }
ok() { echo "[OK] $*"; }

[[ -f "$DOCKERFILE" ]] || fail "No existe $DOCKERFILE"
[[ -f "$DEPLOY_SCRIPT" ]] || fail "No existe $DEPLOY_SCRIPT"

cp "$DOCKERFILE" "$DOCKERFILE.bak.before-vite-build-args"
cp "$DEPLOY_SCRIPT" "$DEPLOY_SCRIPT.bak.before-vite-build-args"

python3 - "$DOCKERFILE" "$DEPLOY_SCRIPT" <<'PY'
from pathlib import Path
import re
import sys

dockerfile = Path(sys.argv[1])
script = Path(sys.argv[2])

d = dockerfile.read_text()

vite_block = '''ARG VITE_API_BASE_URL
ARG VITE_GATEWAY_URL
ARG VITE_KEYCLOAK_URL
ARG VITE_KEYCLOAK_REALM
ARG VITE_KEYCLOAK_CLIENT_ID

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL} \\
    VITE_GATEWAY_URL=${VITE_GATEWAY_URL} \\
    VITE_KEYCLOAK_URL=${VITE_KEYCLOAK_URL} \\
    VITE_KEYCLOAK_REALM=${VITE_KEYCLOAK_REALM} \\
    VITE_KEYCLOAK_CLIENT_ID=${VITE_KEYCLOAK_CLIENT_ID}
'''

if "ARG VITE_KEYCLOAK_URL" not in d:
    match = re.search(r'(?m)^RUN\s+npm\s+run\s+build\s*$', d)
    if not match:
        raise SystemExit(
            "No encontré 'RUN npm run build' en frontend/Dockerfile."
        )
    d = d[:match.start()] + vite_block + "\n" + d[match.start():]

dockerfile.write_text(d)

s = script.read_text()
s = s.replace(
    'eval "$(minikube docker-env)"',
    'eval "$(minikube docker-env --shell bash)"'
)

build_pattern = re.compile(
    r'(?m)^(?P<indent>\s*)if ! docker build --no-cache -t "\$image" "\$PROJECT_ROOT/frontend"; then$'
)

replacement = r'''\g<indent>if ! docker build --no-cache \
\g<indent>  --build-arg "VITE_API_BASE_URL=$(grep '^VITE_API_BASE_URL=' "$FRONTEND_ENV" | cut -d= -f2-)" \
\g<indent>  --build-arg "VITE_GATEWAY_URL=$(grep '^VITE_GATEWAY_URL=' "$FRONTEND_ENV" | cut -d= -f2-)" \
\g<indent>  --build-arg "VITE_KEYCLOAK_URL=$(grep '^VITE_KEYCLOAK_URL=' "$FRONTEND_ENV" | cut -d= -f2-)" \
\g<indent>  --build-arg "VITE_KEYCLOAK_REALM=$(grep '^VITE_KEYCLOAK_REALM=' "$FRONTEND_ENV" | cut -d= -f2-)" \
\g<indent>  --build-arg "VITE_KEYCLOAK_CLIENT_ID=$(grep '^VITE_KEYCLOAK_CLIENT_ID=' "$FRONTEND_ENV" | cut -d= -f2-)" \
\g<indent>  -t "$image" \
\g<indent>  "$PROJECT_ROOT/frontend"; then'''

if '--build-arg "VITE_KEYCLOAK_URL=' not in s:
    s, count = build_pattern.subn(replacement, s, count=1)
    if count != 1:
        simple_pattern = re.compile(
            r'(?m)^(?P<indent>\s*)docker build --no-cache -t "\$image" "\$PROJECT_ROOT/frontend"$'
        )
        simple_replacement = r'''\g<indent>docker build --no-cache \
\g<indent>  --build-arg "VITE_API_BASE_URL=$(grep '^VITE_API_BASE_URL=' "$FRONTEND_ENV" | cut -d= -f2-)" \
\g<indent>  --build-arg "VITE_GATEWAY_URL=$(grep '^VITE_GATEWAY_URL=' "$FRONTEND_ENV" | cut -d= -f2-)" \
\g<indent>  --build-arg "VITE_KEYCLOAK_URL=$(grep '^VITE_KEYCLOAK_URL=' "$FRONTEND_ENV" | cut -d= -f2-)" \
\g<indent>  --build-arg "VITE_KEYCLOAK_REALM=$(grep '^VITE_KEYCLOAK_REALM=' "$FRONTEND_ENV" | cut -d= -f2-)" \
\g<indent>  --build-arg "VITE_KEYCLOAK_CLIENT_ID=$(grep '^VITE_KEYCLOAK_CLIENT_ID=' "$FRONTEND_ENV" | cut -d= -f2-)" \
\g<indent>  -t "$image" \
\g<indent>  "$PROJECT_ROOT/frontend"'''
        s, count = simple_pattern.subn(simple_replacement, s, count=1)
        if count != 1:
            raise SystemExit(
                "No encontré la línea docker build esperada en el script."
            )

script.write_text(s)
PY

bash -n "$DEPLOY_SCRIPT"
grep -q 'ARG VITE_KEYCLOAK_URL' "$DOCKERFILE"
grep -q -- '--build-arg "VITE_KEYCLOAK_URL=' "$DEPLOY_SCRIPT"
grep -q 'minikube docker-env --shell bash' "$DEPLOY_SCRIPT"

ok "Dockerfile preparado para recibir variables Vite durante el build"
ok "Script preparado para pasar la URL pública como build args"
ok "Sintaxis Bash validada"
echo
echo "Ahora ejecuta:"
echo "  ./scripts/deploy-single-tunnel-demo.sh stop"
echo "  ./scripts/deploy-single-tunnel-demo.sh https"
