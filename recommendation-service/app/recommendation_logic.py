from app.schemas import Recommendation
from app.logger_config import logger


def get_default_recommendations(student_id: int) -> list[Recommendation]:
    return [
        Recommendation(
            title="Curso recomendado: Comunicación entre microservicios",
            reason="Completaste un recurso relacionado con sistemas distribuidos."
        )
    ]


def generate_recommendation(resource_title: str) -> Recommendation:
    title_lower = resource_title.lower()

    # =========================
    # SISTEMAS DISTRIBUIDOS
    # =========================

    if "docker" in title_lower:
        logger.info(
        "Recurso relacionado con Docker detectado"
        )   

        return Recommendation(
            title="Curso recomendado: Kubernetes básico",
            reason="Completaste un recurso relacionado con Docker. Kubernetes te ayudará a profundizar en orquestación de contenedores."
        )

    if "rabbitmq" in title_lower or "colas" in title_lower:
        logger.info(
        "Recurso relacionado con RabbitMQ detectado"
        )  

        return Recommendation(
            title="Curso recomendado: Comunicación asíncrona con RabbitMQ",
            reason="Este curso complementa tus conocimientos sobre sistemas de colas y procesamiento distribuido."
        )

    if "microservicios" in title_lower:
        logger.info(
        "Recurso relacionado con Microservicios detectado"
        )  

        return Recommendation(
            title="Curso recomendado: Arquitectura de Microservicios",
            reason="Este recurso te ayudará a comprender la división de servicios y comunicación distribuida."
        )

    if "grpc" in title_lower or "rest" in title_lower:
        logger.info(
        "Recurso relacionado con GRPC detectado"
        )  

        return Recommendation(
            title="Curso recomendado: Comunicación entre Microservicios",
            reason="Este curso profundiza en APIs REST y gRPC para sistemas distribuidos."
        )

    # =========================
    # PROGRAMACIÓN WEB
    # =========================

    if "react" in title_lower:
        logger.info(
        "Recurso relacionado con React detectado"
        )  

        return Recommendation(
            title="Curso recomendado: Desarrollo Frontend con React",
            reason="Este curso reforzará tus conocimientos sobre componentes, estados y consumo de APIs."
        )

    if "angular" in title_lower:
        logger.info(
        "Recurso relacionado con Angular detectado"
        )  

        return Recommendation(
            title="Curso recomendado: Angular para Aplicaciones Web",
            reason="Este recurso complementa el desarrollo de interfaces modernas y escalables."
        )

    if "fastapi" in title_lower or "spring boot" in title_lower:
        logger.info(
        "Recurso relacionado con FastAPI detectado"
        )  

        return Recommendation(
            title="Curso recomendado: Integración Frontend y Backend",
            reason="Este curso te ayudará a conectar aplicaciones web con APIs REST modernas."
        )

    if "jwt" in title_lower or "autenticación" in title_lower:
        logger.info(
        "Recurso relacionado con JWT detectado"
        )  

        return Recommendation(
            title="Curso recomendado: Seguridad y Autenticación Web",
            reason="Este recurso profundiza en autenticación con JWT y protección de APIs."
        )

    # =========================
    # REDES NEURONALES
    # =========================

    if "tensorflow" in title_lower:
        logger.info(
        "Recurso relacionado con Tensorflow detectado"
        )  

        return Recommendation(
            title="Curso recomendado: Redes Neuronales con TensorFlow",
            reason="Este curso te ayudará a construir modelos de aprendizaje profundo."
        )

    if "pytorch" in title_lower:
        logger.info(
        "Recurso relacionado con Pytorch detectado"
        ) 

        return Recommendation(
            title="Curso recomendado: Deep Learning con PyTorch",
            reason="Este recurso complementa el desarrollo de modelos neuronales avanzados."
        )

    if "perceptrón" in title_lower or "neurona" in title_lower:
        logger.info(
        "Recurso relacionado con Peceptrón detectado"
        ) 

        return Recommendation(
            title="Curso recomendado: Fundamentos de Redes Neuronales",
            reason="Este curso reforzará conceptos básicos de aprendizaje automático."
        )

    if "clasificación" in title_lower:
        logger.info(
        "Recurso relacionado con Clasificación detectado"
        ) 

        return Recommendation(
            title="Curso recomendado: Modelos de Clasificación",
            reason="Este recurso profundiza en técnicas de clasificación supervisada."
        )

    # =========================
    # ALMACENAMIENTO Y MINERÍA DE DATOS
    # =========================

    if "sql" in title_lower:
        logger.info(
        "Recurso relacionado con SQL detectado"
        ) 

        return Recommendation(
            title="Curso recomendado: SQL Avanzado",
            reason="Este curso fortalecerá tus habilidades de consultas y optimización de bases de datos."
        )

    if "mongodb" in title_lower:
        logger.info(
        "Recurso relacionado con MongoDB detectado"
        ) 

        return Recommendation(
            title="Curso recomendado: Bases de Datos NoSQL con MongoDB",
            reason="Este recurso complementa el manejo de bases de datos orientadas a documentos."
        )

    if "minería de datos" in title_lower or "data mining" in title_lower:
        logger.info(
        "Recurso relacionado con Minería de Datos detectado"
        ) 

        return Recommendation(
            title="Curso recomendado: Técnicas de Minería de Datos",
            reason="Este curso profundiza en análisis de datos y extracción de conocimiento."
        )

    if "etl" in title_lower or "data warehouse" in title_lower:
        logger.info(
        "Recurso relacionado con ETL detectado"
        ) 

        return Recommendation(
            title="Curso recomendado: Procesos ETL y Data Warehouse",
            reason="Este recurso te ayudará a comprender integración y almacenamiento de datos."
        )

    # =========================
    # HCI
    # =========================

    if "ux" in title_lower or "ui" in title_lower:
        logger.info(
        "Recurso relacionado con UI detectado"
        ) 

        return Recommendation(
            title="Curso recomendado: Diseño UX/UI",
            reason="Este curso complementa principios de experiencia e interfaces de usuario."
        )

    if "ley de fitts" in title_lower:
        logger.info(
        "Recurso relacionado con Ley de Fitts detectado"
        ) 

        return Recommendation(
            title="Curso recomendado: Principios de Interacción Humano Computador",
            reason="Este recurso profundiza en modelos y leyes de interacción en interfaces."
        )

    if "accesibilidad" in title_lower:
        logger.info(
        "Recurso relacionado con Accesibilidad detectado"
        ) 

        return Recommendation(
            title="Curso recomendado: Accesibilidad en Aplicaciones Web",
            reason="Este curso te ayudará a construir interfaces inclusivas y accesibles."
        )

    if "prototipado" in title_lower:
        logger.info(
        "Recurso relacionado con Prototipado detectado"
        ) 

        return Recommendation(
            title="Curso recomendado: Prototipado y Diseño de Interfaces",
            reason="Este recurso complementa el diseño y validación de interfaces digitales."
        )


    logger.warning(
    "No se encontró coincidencia específica. "
    "Se devolverá recomendación general."
    )
    # =========================
    # RECOMENDACIÓN GENERAL
    # =========================

    return Recommendation(
        title="Curso recomendado: Estrategias de Aprendizaje para Computación",
        reason="Este recurso puede ayudarte a reforzar habilidades generales de estudio y desarrollo académico."
    )
