#!/usr/bin/env bash
set -euo pipefail

RABBITMQ_HOST="${RABBITMQ_HOST:-localhost}"
RABBITMQ_PORT="${RABBITMQ_PORT:-15672}"
RABBITMQ_MANAGEMENT_URL="${RABBITMQ_MANAGEMENT_URL:-http://${RABBITMQ_HOST}:${RABBITMQ_PORT}}"
RABBITMQ_USERNAME="${RABBITMQ_USERNAME:-academic_platform_rabbitmq}"
RABBITMQ_PASSWORD="${RABBITMQ_PASSWORD:-change_this_rabbitmq_password}"
ACADEMIC_EVENTS_EXCHANGE="${ACADEMIC_EVENTS_EXCHANGE:-academic.events.exchange}"
ACADEMIC_RESOURCE_COMPLETED_ROUTING_KEY="${ACADEMIC_RESOURCE_COMPLETED_ROUTING_KEY:-academic.resource.completed}"
TOTAL_MESSAGES="${TOTAL_MESSAGES:-40}"
CONCURRENCY="${CONCURRENCY:-5}"
STUDENT_POOL="${STUDENT_POOL:-3}"
RESOURCE_POOL="${RESOURCE_POOL:-4}"

require_non_empty() {
  local value="$1"
  local message="$2"

  if [ -z "${value}" ]; then
    printf 'Error: %s\n' "${message}" >&2
    exit 1
  fi
}

require_non_empty "${RABBITMQ_HOST}" "RABBITMQ_HOST no puede estar vacío."
require_non_empty "${RABBITMQ_PORT}" "RABBITMQ_PORT no puede estar vacío."
require_non_empty "${RABBITMQ_USERNAME}" "RABBITMQ_USERNAME no puede estar vacío."
require_non_empty "${RABBITMQ_PASSWORD}" "RABBITMQ_PASSWORD no puede estar vacío."
require_non_empty "${ACADEMIC_EVENTS_EXCHANGE}" "ACADEMIC_EVENTS_EXCHANGE no puede estar vacío."
require_non_empty "${ACADEMIC_RESOURCE_COMPLETED_ROUTING_KEY}" "ACADEMIC_RESOURCE_COMPLETED_ROUTING_KEY no puede estar vacío."

if ! [[ "${TOTAL_MESSAGES}" =~ ^[0-9]+$ ]] || [ "${TOTAL_MESSAGES}" -le 0 ]; then
  printf 'Error: TOTAL_MESSAGES debe ser un entero positivo.\n' >&2
  exit 1
fi

if ! [[ "${CONCURRENCY}" =~ ^[0-9]+$ ]] || [ "${CONCURRENCY}" -le 0 ]; then
  printf 'Error: CONCURRENCY debe ser un entero positivo.\n' >&2
  exit 1
fi

EXCHANGE_PATH="$(python3 - <<'PY'
import os
from urllib.parse import quote

print(quote(os.getenv("ACADEMIC_EVENTS_EXCHANGE", "academic.events.exchange"), safe=""))
PY
)"

publish_event() {
  local index="$1"
  local request_body

  request_body="$(python3 - "$index" <<'PY'
import json
import os
import sys
from datetime import datetime, timezone

index = int(sys.argv[1])
student_pool = int(os.getenv("STUDENT_POOL", "3"))
resource_pool = int(os.getenv("RESOURCE_POOL", "4"))

student_id = (index % student_pool) + 1
resource_id = (index % resource_pool) + 1

payload = {
    "eventType": "RESOURCE_COMPLETED",
    "studentId": student_id,
    "subjectId": 1,
    "courseId": 1,
    "resourceId": resource_id,
    "resourceTitle": f"Recurso de carga {resource_id}",
    "completedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
}

body = {
    "properties": {
        "content_type": "application/json",
        "delivery_mode": 2,
        "type": "RESOURCE_COMPLETED",
    },
    "routing_key": os.getenv(
        "ACADEMIC_RESOURCE_COMPLETED_ROUTING_KEY",
        "academic.resource.completed",
    ),
    "payload": json.dumps(payload),
    "payload_encoding": "string",
}

print(json.dumps(body))
PY
)"

  curl --fail --silent --show-error \
    --user "${RABBITMQ_USERNAME}:${RABBITMQ_PASSWORD}" \
    --header "content-type: application/json" \
    --request POST \
    --data "${request_body}" \
    "${RABBITMQ_MANAGEMENT_URL}/api/exchanges/%2F/${EXCHANGE_PATH}/publish" >/dev/null
}

export STUDENT_POOL RESOURCE_POOL ACADEMIC_RESOURCE_COMPLETED_ROUTING_KEY

for index in $(seq 1 "${TOTAL_MESSAGES}"); do
  publish_event "${index}" &

  while [ "$(jobs -pr | wc -l)" -ge "${CONCURRENCY}" ]; do
    wait -n
  done
done

wait

printf 'Publicado %s mensajes RESOURCE_COMPLETED en %s con concurrencia %s\n' \
  "${TOTAL_MESSAGES}" \
  "${ACADEMIC_EVENTS_EXCHANGE}" \
  "${CONCURRENCY}"
