import json
import logging
import os
import sys
import time
from pathlib import Path

import pika
from pydantic import ValidationError


WORKER_DIR = Path(__file__).resolve().parent
LOCAL_SERVICE_PATH = WORKER_DIR.parent / "recommendation-service"
CONTAINER_SERVICE_PATH = WORKER_DIR
RECOMMENDATION_SERVICE_PATH = (
    CONTAINER_SERVICE_PATH if (CONTAINER_SERVICE_PATH / "app").exists() else LOCAL_SERVICE_PATH
)
sys.path.append(str(RECOMMENDATION_SERVICE_PATH))

from app.recommendation_logic import generate_recommendation
from app.schemas import ResourceCompletedEvent


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger("recommendation-worker")


RESOURCE_COMPLETED = "RESOURCE_COMPLETED"
MAX_CONNECTION_ATTEMPTS = int(os.getenv("RABBITMQ_CONNECTION_ATTEMPTS", "5"))
CONNECTION_RETRY_DELAY_SECONDS = int(os.getenv("RABBITMQ_CONNECTION_RETRY_DELAY_SECONDS", "5"))


def get_config() -> dict:
    return {
        "host": os.getenv("RABBITMQ_HOST", "localhost"),
        "port": int(os.getenv("RABBITMQ_PORT", "5672")),
        "username": os.getenv("RABBITMQ_USERNAME", "guest"),
        "password": os.getenv("RABBITMQ_PASSWORD", "guest"),
        # Prefer the academic-specific variable names defined by the project contract.
        # Keep the older names as fallback so local runs remain compatible.
        "exchange": os.getenv(
            "ACADEMIC_EVENTS_EXCHANGE",
            os.getenv("RABBITMQ_EXCHANGE", "academic.events.exchange")
        ),
        "queue": os.getenv(
            "ACADEMIC_EVENTS_QUEUE",
            os.getenv("RABBITMQ_QUEUE", "academic.events.queue")
        ),
        "routing_key": os.getenv(
            "ACADEMIC_RESOURCE_COMPLETED_ROUTING_KEY",
            os.getenv("RABBITMQ_ROUTING_KEY", "academic.resource.completed")
        ),
    }


def create_connection(config: dict) -> pika.BlockingConnection:
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
    channel.exchange_declare(
        exchange=config["exchange"],
        exchange_type="topic",
        durable=True
    )

    channel.queue_declare(
        queue=config["queue"],
        durable=True
    )

    channel.queue_bind(
        exchange=config["exchange"],
        queue=config["queue"],
        routing_key=config["routing_key"]
    )

    channel.basic_qos(prefetch_count=1)

    logger.info(
        "Escuchando cola '%s' enlazada a exchange '%s' con routing key '%s'",
        config["queue"],
        config["exchange"],
        config["routing_key"]
    )


def handle_message(body: bytes) -> None:
    try:
        payload = json.loads(body.decode("utf-8"))
    except json.JSONDecodeError as exception:
        logger.error("Mensaje descartado: JSON inválido. Error: %s", exception)
        return

    try:
        event = ResourceCompletedEvent.model_validate(payload)
    except ValidationError as exception:
        logger.error("Mensaje descartado: evento inválido. Error: %s", exception)
        return

    logger.info("Evento recibido: %s", event.eventType)

    if event.eventType != RESOURCE_COMPLETED:
        logger.warning(
            "Mensaje descartado: eventType no soportado '%s'",
            event.eventType
        )
        return

    logger.info("Estudiante: %s", event.studentId)
    logger.info(
        "Recurso completado: %s (%s)",
        event.resourceTitle,
        event.resourceId
    )

    recommendation = generate_recommendation(event.resourceTitle)

    logger.info(
        "Recomendación generada para estudiante %s: %s - %s",
        event.studentId,
        recommendation.title,
        recommendation.reason
    )


def on_message(channel, method, properties, body) -> None:
    try:
        handle_message(body)
        channel.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as exception:
        logger.exception("Error inesperado procesando mensaje: %s", exception)
        channel.basic_nack(
            delivery_tag=method.delivery_tag,
            requeue=False
        )


def main() -> None:
    config = get_config()

    connection = None
    last_error = None
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

    channel.basic_consume(
        queue=config["queue"],
        on_message_callback=on_message
    )

    try:
        channel.start_consuming()
    except KeyboardInterrupt:
        logger.info("Worker detenido manualmente")
        channel.stop_consuming()
    finally:
        connection.close()
        logger.info("Conexión a RabbitMQ cerrada")


if __name__ == "__main__":
    main()
