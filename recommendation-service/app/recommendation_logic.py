from app.schemas import Recommendation


def get_default_recommendations(student_id: int) -> list[Recommendation]:
    return [
        Recommendation(
            title="Curso recomendado: Introducción a Docker",
            reason="Este curso te ayudará a reforzar conceptos de contenedores y microservicios."
        ),
        Recommendation(
            title="Curso recomendado: Comunicación con RabbitMQ",
            reason="Este recurso complementa el aprendizaje sobre comunicación asíncrona."
        )
    ]


def generate_recommendation(resource_title: str) -> Recommendation:
    title_lower = resource_title.lower()

    if "docker" in title_lower:
        return Recommendation(
            title="Curso recomendado: Kubernetes básico",
            reason="Completaste un recurso relacionado con Docker. Kubernetes te ayudará a profundizar en orquestación de contenedores."
        )

    if "java" in title_lower:
        return Recommendation(
            title="Curso recomendado: Programación Orientada a Objetos",
            reason="Completaste un recurso relacionado con Java. Este curso refuerza conceptos clave de POO."
        )

    if "base de datos" in title_lower or "sql" in title_lower:
        return Recommendation(
            title="Curso recomendado: SQL avanzado",
            reason="Completaste un recurso relacionado con bases de datos. SQL avanzado fortalecerá tus habilidades de consulta."
        )

    if "sistemas distribuidos" in title_lower or "microservicios" in title_lower:
        return Recommendation(
            title="Curso recomendado: Arquitectura de Microservicios",
            reason="Completaste un recurso relacionado con sistemas distribuidos. Este curso complementa la comunicación entre servicios."
        )

    return Recommendation(
        title="Curso recomendado: Estrategias de estudio para Computación",
        reason="Este recurso puede ayudarte a reforzar tus conocimientos generales de la carrera."
    )