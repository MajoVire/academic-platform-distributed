#!/usr/bin/env bash
set -euo pipefail

RABBITMQ_MANAGEMENT_URL="${RABBITMQ_MANAGEMENT_URL:-http://localhost:15672}"
RABBITMQ_USERNAME="${RABBITMQ_USERNAME:-guest}"
RABBITMQ_PASSWORD="${RABBITMQ_PASSWORD:-change_this_rabbitmq_password}"
ACADEMIC_EVENTS_EXCHANGE="${ACADEMIC_EVENTS_EXCHANGE:-academic.events.exchange}"
ACADEMIC_RESOURCE_COMPLETED_ROUTING_KEY="${ACADEMIC_RESOURCE_COMPLETED_ROUTING_KEY:-academic.resource.completed}"

REQUEST_BODY="$(python3 - <<'PY'
import json
import os
from datetime import datetime

payload = {
    "eventType": "RESOURCE_COMPLETED",
    "studentId": 1,
    "subjectId": 1,
    "courseId": 1,
    "resourceId": 1,
    "resourceTitle": "Introduccion a Docker",
    "completedAt": datetime.now().isoformat(timespec="seconds"),
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

EXCHANGE_PATH="$(python3 - <<'PY'
import os
from urllib.parse import quote

print(quote(os.getenv("ACADEMIC_EVENTS_EXCHANGE", "academic.events.exchange"), safe=""))
PY
)"

curl --fail --silent --show-error \
  --user "${RABBITMQ_USERNAME}:${RABBITMQ_PASSWORD}" \
  --header "content-type: application/json" \
  --request POST \
  --data "${REQUEST_BODY}" \
  "${RABBITMQ_MANAGEMENT_URL}/api/exchanges/%2F/${EXCHANGE_PATH}/publish"

printf "\nEvento RESOURCE_COMPLETED publicado en %s con routing key %s\n" \
  "${ACADEMIC_EVENTS_EXCHANGE}" \
  "${ACADEMIC_RESOURCE_COMPLETED_ROUTING_KEY}"
