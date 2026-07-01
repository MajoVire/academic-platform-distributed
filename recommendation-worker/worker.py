import json
import logging
import os
import sys
import time
import urllib.error
import urllib.request
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
from typing import Any

import pika
from pydantic import ValidationError


# Se define la ruta del proyecto para poder importar la lógica y los schemas
# del recommendation-service, tanto si se ejecuta localmente como dentro de Docker.
WORKER_DIR = Path(__file__).resolve().parent
LOCAL_SERVICE_PATH = WORKER_DIR.parent / "recommendation-service"
CONTAINER_SERVICE_PATH = WORKER_DIR
RECOMMENDATION_SERVICE_PATH = (
    CONTAINER_SERVICE_PATH
    if (CONTAINER_SERVICE_PATH / "app" / "recommendation_logic.py").exists()
    else LOCAL_SERVICE_PATH
)
sys.path.insert(0, str(RECOMMENDATION_SERVICE_PATH))

from app.recommendation_logic import generate_recommendation


EVENTS_MODULE_PATH = WORKER_DIR / "app" / "events.py"
events_spec = spec_from_file_location("recommendation_worker_events", EVENTS_MODULE_PATH)
events_module = module_from_spec(events_spec)
events_spec.loader.exec_module(events_module)

RESOURCE_COMPLETED = events_module.RESOURCE_COMPLETED
RECOMMENDATION_GENERATED = events_module.RECOMMENDATION_GENERATED
ResourceCompletedEvent = events_module.ResourceCompletedEvent
RecommendationPayload = events_module.RecommendationPayload
build_recommendation_generated_event = events_module.build_recommendation_generated_event


# Configuración básica de logs para ver en consola qué hace el worker.
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger("recommendation-worker")


# Cantidad de intentos y tiempo de espera para conectarse a RabbitMQ.
# Esto ayuda porque RabbitMQ puede tardar unos segundos en estar listo.
MAX_CONNECTION_ATTEMPTS = int(os.getenv("RABBITMQ_CONNECTION_ATTEMPTS", "5"))
CONNECTION_RETRY_DELAY_SECONDS = int(os.getenv("RABBITMQ_CONNECTION_RETRY_DELAY_SECONDS", "5"))


class NonRetryableMessageError(Exception):
    """Indica que el mensaje debe descartarse con ack."""


class TemporaryProcessingError(Exception):
    """Indica que el mensaje puede reintentarse de forma controlada."""


def parse_bool(value: str) -> bool:
    return value.strip().lower() in {"1", "true", "yes", "y", "on"}


def get_config() -> dict:
    """
    Obtiene la configuración necesaria para conectarse a RabbitMQ.
    Usa variables de entorno si existen; si no, usa valores por defecto.
    """
    return {
        "host": os.getenv("RABBITMQ_HOST", "localhost"),
        "port": int(os.getenv("RABBITMQ_PORT", "5672")),
        "username": os.getenv("RABBITMQ_USERNAME", "guest"),
        "password": os.getenv("RABBITMQ_PASSWORD", "guest"),

        # Entrada: eventos emitidos por academic-service.
        "input_exchange": os.getenv(
            "ACADEMIC_EVENTS_EXCHANGE",
            os.getenv("RABBITMQ_EXCHANGE", "academic.events.exchange")
        ),
        "input_queue": os.getenv(
            "ACADEMIC_EVENTS_QUEUE",
            os.getenv("RABBITMQ_QUEUE", "academic.events.queue")
        ),
        "input_routing_key": os.getenv(
            "ACADEMIC_RESOURCE_COMPLETED_ROUTING_KEY",
            os.getenv("RABBITMQ_ROUTING_KEY", "academic.resource.completed")
        ),

        # Salida: eventos listos para que el notificador/WebSocket los consuma.
        "output_exchange": os.getenv(
            "ACADEMIC_NOTIFICATIONS_EXCHANGE",
            "academic.notifications.exchange"
        ),
        "output_routing_key": os.getenv(
            "ACADEMIC_RECOMMENDATION_GENERATED_ROUTING_KEY",
            "academic.recommendation.generated"
        ),
        "requeue_on_failure": parse_bool(os.getenv(
            "RECOMMENDATION_WORKER_REQUEUE_ON_FAILURE",
            "false"
        )),
        "academic_service_url": os.getenv(
            "ACADEMIC_SERVICE_URL",
            "http://academic-service:8080"
        ).rstrip("/"),
        "academic_service_token": os.getenv(
            "RECOMMENDATION_WORKER_ACADEMIC_SERVICE_TOKEN",
            ""
        ).strip(),
        "academic_service_timeout_seconds": float(os.getenv(
            "RECOMMENDATION_WORKER_ACADEMIC_SERVICE_TIMEOUT_SECONDS",
            "2"
        )),
    }


def create_connection(config: dict) -> pika.BlockingConnection:
    """
    Crea la conexión con RabbitMQ usando las credenciales configuradas.
    """
    credentials = pika.PlainCredentials(
        config["username"],
        config["password"]
    )

    parameters = pika.ConnectionParameters(
        host=config["host"],
        port=config["port"],
        credentials=credentials
    )

    logger.info(
        "Conectando a RabbitMQ en %s:%s",
        config["host"],
        config["port"]
    )

    return pika.BlockingConnection(parameters)


def configure_channel(channel: pika.adapters.blocking_connection.BlockingChannel, config: dict) -> None:
    """
    Declara el exchange, la cola y la unión entre ambos.
    Esto permite que el worker reciba eventos con la routing key esperada.
    """
    channel.exchange_declare(
        exchange=config["input_exchange"],
        exchange_type="topic",
        durable=True
    )

    channel.queue_declare(
        queue=config["input_queue"],
        durable=True
    )

    channel.queue_bind(
        exchange=config["input_exchange"],
        queue=config["input_queue"],
        routing_key=config["input_routing_key"]
    )

    channel.exchange_declare(
        exchange=config["output_exchange"],
        exchange_type="topic",
        durable=True
    )

    # Procesa un mensaje a la vez para evitar tomar varios mensajes sin terminar.
    channel.basic_qos(prefetch_count=1)
    channel.confirm_delivery()

    logger.info(
        "Escuchando RESOURCE_COMPLETED en cola '%s' enlazada a exchange '%s' con routing key '%s'",
        config["input_queue"],
        config["input_exchange"],
        config["input_routing_key"]
    )
    logger.info(
        "Publicando RECOMMENDATION_GENERATED en exchange '%s' con routing key '%s'",
        config["output_exchange"],
        config["output_routing_key"]
    )


def decode_resource_completed_event(body: bytes) -> ResourceCompletedEvent:
    """
    Valida el JSON y verifica que el mensaje sea RESOURCE_COMPLETED.
    Los errores de contrato son no reintentables para evitar ciclos infinitos.
    """
    try:
        payload = json.loads(body.decode("utf-8"))
    except json.JSONDecodeError as exception:
        raise NonRetryableMessageError(f"JSON invalido: {exception}") from exception

    try:
        event = ResourceCompletedEvent.model_validate(payload)
    except ValidationError as exception:
        raise NonRetryableMessageError(f"Contrato RESOURCE_COMPLETED invalido: {exception}") from exception

    if event.eventType != RESOURCE_COMPLETED:
        raise NonRetryableMessageError(f"eventType no soportado: {event.eventType}")

    return event


def fetch_json(config: dict, path: str) -> dict[str, Any] | list[Any] | None:
    url = f"{config['academic_service_url']}{path}"
    headers = {"Accept": "application/json"}
    if config["academic_service_token"]:
        headers["Authorization"] = f"Bearer {config['academic_service_token']}"

    request = urllib.request.Request(url, headers=headers, method="GET")

    try:
        with urllib.request.urlopen(
            request,
            timeout=config["academic_service_timeout_seconds"]
        ) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exception:
        if exception.code in {401, 403}:
            logger.warning(
                "Consulta a academic-service no autorizada para %s. "
                "Se continuará con recomendación local. Configure RECOMMENDATION_WORKER_ACADEMIC_SERVICE_TOKEN si aplica.",
                path
            )
            return None
        if 400 <= exception.code < 500:
            logger.warning(
                "Consulta a academic-service descartada para %s: HTTP %s",
                path,
                exception.code
            )
            return None

        logger.warning(
            "academic-service respondió HTTP %s para %s. Se continuará con recomendación local.",
            exception.code,
            path
        )
        return None
    except (TimeoutError, urllib.error.URLError) as exception:
        logger.warning(
            "academic-service no disponible para %s: %s. Se continuará con recomendación local.",
            path,
            exception
        )
        return None
    except json.JSONDecodeError as exception:
        logger.warning(
            "Respuesta JSON inválida desde academic-service para %s: %s",
            path,
            exception
        )
        return None


def fetch_academic_context(config: dict, event: ResourceCompletedEvent) -> dict[str, Any]:
    progress = fetch_json(config, f"/api/students/{event.studentId}/progress")
    course_resources = fetch_json(config, f"/api/courses/{event.courseId}/resources")
    existing_recommendations = fetch_json(config, f"/api/students/{event.studentId}/recommendations")

    completed_ids = set()
    if isinstance(progress, dict):
        completed_ids = set(progress.get("completedResourceIds") or [])

    resources = course_resources if isinstance(course_resources, list) else []
    recommendations = []
    if isinstance(existing_recommendations, dict):
        recommendations = existing_recommendations.get("recommendations") or []

    pending_resources = [
        resource for resource in resources
        if isinstance(resource, dict)
        and resource.get("id") not in completed_ids
        and resource.get("id") != event.resourceId
    ]

    logger.info(
        "Datos consultados para recomendación: progress=%s completed=%s courseResources=%s pendingResources=%s existingRecommendations=%s",
        "disponible" if isinstance(progress, dict) else "no disponible",
        len(completed_ids),
        len(resources),
        len(pending_resources),
        len(recommendations)
    )

    return {
        "progress": progress if isinstance(progress, dict) else None,
        "course_resources": resources,
        "pending_resources": pending_resources,
        "existing_recommendations": recommendations,
    }


def generate_contextual_recommendation(
    event: ResourceCompletedEvent,
    context: dict[str, Any],
) -> RecommendationPayload:
    pending_resources = context["pending_resources"]
    if pending_resources:
        next_resource = pending_resources[0]
        title = next_resource.get("title") or "siguiente recurso del curso"
        description = next_resource.get("description") or "continúa con el siguiente tema disponible."
        logger.info(
            "Recomendación basada en recurso pendiente del mismo curso: resourceId=%s title='%s'",
            next_resource.get("id"),
            title
        )
        return RecommendationPayload(
            title=f"Recurso recomendado: {title}",
            reason=(
                f"Completaste '{event.resourceTitle}'. "
                f"El siguiente recurso pendiente del mismo curso te ayuda a continuar: {description}"
            )
        )

    existing_recommendations = context["existing_recommendations"]
    if existing_recommendations:
        recommendation = existing_recommendations[0]
        title = recommendation.get("title") or "Recomendación académica"
        reason = recommendation.get("reason") or "Recomendación obtenida desde el servicio académico."
        logger.info("Recomendación reutilizada desde academic-service: title='%s'", title)
        return RecommendationPayload(title=title, reason=reason)

    recommendation = generate_recommendation(event.resourceTitle)
    logger.info(
        "Recomendación generada con lógica local por título del recurso: resourceTitle='%s'",
        event.resourceTitle
    )
    return RecommendationPayload(
        title=recommendation.title,
        reason=recommendation.reason
    )


def publish_recommendation_generated(channel, config: dict, event) -> None:
    payload = json.dumps(event.model_dump(mode="json"), ensure_ascii=False).encode("utf-8")

    properties = pika.BasicProperties(
        content_type="application/json",
        delivery_mode=pika.DeliveryMode.Persistent,
        type=RECOMMENDATION_GENERATED,
        correlation_id=f"student-{event.studentId}-resource-{event.resourceId}",
        timestamp=int(time.time()),
    )

    try:
        channel.basic_publish(
            exchange=config["output_exchange"],
            routing_key=config["output_routing_key"],
            body=payload,
            properties=properties,
            mandatory=False,
        )
    except pika.exceptions.AMQPError as exception:
        raise TemporaryProcessingError(
            f"No fue posible publicar RECOMMENDATION_GENERATED: {exception}"
        ) from exception

    logger.info(
        "Evento de resultado publicado: eventType=%s eventId=%s exchange=%s routingKey=%s",
        event.eventType,
        event.eventId,
        config["output_exchange"],
        config["output_routing_key"]
    )


def handle_message(channel, config: dict, body: bytes) -> None:
    """
    Procesa el mensaje recibido, genera una recomendación y publica el resultado.
    """
    event = decode_resource_completed_event(body)

    logger.info("Evento recibido: %s", event.eventType)
    logger.info("Estudiante: %s", event.studentId)
    logger.info(
        "Recurso completado: %s (%s), subjectId=%s, courseId=%s, completedAt=%s",
        event.resourceTitle,
        event.resourceId,
        event.subjectId,
        event.courseId,
        event.completedAt.isoformat()
    )

    context = fetch_academic_context(config, event)
    recommendation_payload = generate_contextual_recommendation(event, context)
    recommendation_event = build_recommendation_generated_event(
        event,
        recommendation_payload
    )

    logger.info(
        "Recomendación generada para estudiante %s: title='%s', reason='%s'",
        event.studentId,
        recommendation_payload.title,
        recommendation_payload.reason
    )

    publish_recommendation_generated(channel, config, recommendation_event)


def on_message(config: dict, channel, method, properties, body) -> None:
    """
    Callback que RabbitMQ ejecuta cada vez que llega un mensaje a la cola.
    Si el mensaje se procesa correctamente, se confirma con basic_ack.
    Si ocurre un error inesperado, se rechaza con basic_nack.
    """
    try:
        handle_message(channel, config, body)
        channel.basic_ack(delivery_tag=method.delivery_tag)
        logger.info("Mensaje confirmado con ack: deliveryTag=%s", method.delivery_tag)
    except NonRetryableMessageError as exception:
        logger.error("Mensaje descartado con ack: %s", exception)
        channel.basic_ack(delivery_tag=method.delivery_tag)
    except TemporaryProcessingError as exception:
        should_requeue = not method.redelivered
        logger.warning(
            "Error temporal procesando mensaje: %s. deliveryTag=%s redelivered=%s requeue=%s",
            exception,
            method.delivery_tag,
            method.redelivered,
            should_requeue
        )
        channel.basic_nack(
            delivery_tag=method.delivery_tag,
            requeue=should_requeue
        )
    except Exception as exception:
        logger.exception("Error inesperado procesando mensaje: %s", exception)
        channel.basic_nack(
            delivery_tag=method.delivery_tag,
            requeue=config["requeue_on_failure"]
        )
        logger.error(
            "Mensaje rechazado con nack: deliveryTag=%s requeue=%s",
            method.delivery_tag,
            config["requeue_on_failure"]
        )


def main() -> None:
    """
    Punto de entrada del worker.
    Se conecta a RabbitMQ, configura la cola y queda escuchando mensajes.
    """
    config = get_config()

    connection = None
    last_error = None

    # Se intenta conectar varias veces porque RabbitMQ puede tardar en iniciar.
    for attempt in range(1, MAX_CONNECTION_ATTEMPTS + 1):
        try:
            connection = create_connection(config)
            break
        except pika.AMQPConnectionError as exception:
            last_error = exception
            logger.warning(
                "Intento %s/%s fallido conectando a RabbitMQ: %s",
                attempt,
                MAX_CONNECTION_ATTEMPTS,
                exception
            )
            if attempt < MAX_CONNECTION_ATTEMPTS:
                time.sleep(CONNECTION_RETRY_DELAY_SECONDS)

    if connection is None:
        raise SystemExit(
            f"No fue posible conectar con RabbitMQ tras {MAX_CONNECTION_ATTEMPTS} intentos: {last_error}"
        )

    channel = connection.channel()

    configure_channel(channel, config)

    # Se indica a RabbitMQ qué función debe ejecutarse cuando llegue un mensaje.
    channel.basic_consume(
        queue=config["input_queue"],
        on_message_callback=lambda channel, method, properties, body: on_message(
            config,
            channel,
            method,
            properties,
            body
        )
    )

    try:
        # El worker queda ejecutándose continuamente esperando mensajes.
        channel.start_consuming()
    except KeyboardInterrupt:
        logger.info("Worker detenido manualmente")
        channel.stop_consuming()
    finally:
        connection.close()
        logger.info("Conexión a RabbitMQ cerrada")


if __name__ == "__main__":
    main()
