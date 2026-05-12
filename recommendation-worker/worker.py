import json
import logging
import os
import sys
import time
from pathlib import Path

import pika
from pydantic import ValidationError


# Se define la ruta del proyecto para poder importar la lógica y los schemas
# del recommendation-service, tanto si se ejecuta localmente como dentro de Docker.
WORKER_DIR = Path(__file__).resolve().parent
LOCAL_SERVICE_PATH = WORKER_DIR.parent / "recommendation-service"
CONTAINER_SERVICE_PATH = WORKER_DIR
RECOMMENDATION_SERVICE_PATH = (
    CONTAINER_SERVICE_PATH if (CONTAINER_SERVICE_PATH / "app").exists() else LOCAL_SERVICE_PATH
)
sys.path.append(str(RECOMMENDATION_SERVICE_PATH))

from app.recommendation_logic import generate_recommendation
from app.schemas import ResourceCompletedEvent


# Configuración básica de logs para ver en consola qué hace el worker.
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger("recommendation-worker")


RESOURCE_COMPLETED = "RESOURCE_COMPLETED"

# Cantidad de intentos y tiempo de espera para conectarse a RabbitMQ.
# Esto ayuda porque RabbitMQ puede tardar unos segundos en estar listo.
MAX_CONNECTION_ATTEMPTS = int(os.getenv("RABBITMQ_CONNECTION_ATTEMPTS", "5"))
CONNECTION_RETRY_DELAY_SECONDS = int(os.getenv("RABBITMQ_CONNECTION_RETRY_DELAY_SECONDS", "5"))


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

        # Estos nombres coinciden con los definidos en el contrato del proyecto.
        # También se dejan nombres antiguos como respaldo para pruebas locales.
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

    # Procesa un mensaje a la vez para evitar tomar varios mensajes sin terminar.
    channel.basic_qos(prefetch_count=1)

    logger.info(
        "Escuchando cola '%s' enlazada a exchange '%s' con routing key '%s'",
        config["queue"],
        config["exchange"],
        config["routing_key"]
    )


def handle_message(body: bytes) -> None:
    """
    Procesa el contenido de un mensaje recibido desde RabbitMQ.
    Valida el JSON, verifica el tipo de evento y genera la recomendación.
    """
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

    # El worker solo procesa eventos de recurso completado.
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

    # Se genera una recomendación usando el título del recurso completado.
    recommendation = generate_recommendation(event.resourceTitle)

    # En esta versión, la recomendación se muestra en logs.
    # Todavía no se guarda en base de datos.
    logger.info(
        "Recomendación generada para estudiante %s: %s - %s",
        event.studentId,
        recommendation.title,
        recommendation.reason
    )


def on_message(channel, method, properties, body) -> None:
    """
    Callback que RabbitMQ ejecuta cada vez que llega un mensaje a la cola.
    Si el mensaje se procesa correctamente, se confirma con basic_ack.
    Si ocurre un error inesperado, se rechaza con basic_nack.
    """
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
        queue=config["queue"],
        on_message_callback=on_message
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