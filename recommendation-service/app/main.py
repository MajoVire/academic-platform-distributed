import os

from fastapi import FastAPI, Path, HTTPException

from app.schemas import (
    RecommendationResponse,
    GenerateRecommendationRequest,
    GenerateRecommendationResponse
)

from app.recommendation_logic import (
    get_default_recommendations,
    generate_recommendation
)

from app.logger_config import logger


# Se crea la aplicación FastAPI.
# Esta app representa el microservicio recommendation-service.
app = FastAPI(
    title="Recommendation Service",
    description="Microservicio encargado de generar y consultar recomendaciones académicas para estudiantes de Computación.",
    version="1.0.0",
    contact={
        "name": "Equipo Plataforma Académica"
    }
)


@app.get(
    "/",
    tags=["General"],
    summary="Estado general del servicio"
)
def root():
    """
    Endpoint raíz del servicio.
    Sirve para comprobar rápidamente que el microservicio está corriendo.
    """

    logger.info("Endpoint raíz consultado")

    return {
        "service": "recommendation-service",
        "status": "running",
        "docs": "/docs"
    }


@app.get(
    "/health",
    tags=["General"],
    summary="Verificar estado del servicio"
)
def health_check():
    """
    Endpoint de health check.
    Se usa para verificar que el servicio está activo y disponible.
    También puede ser usado por Docker para comprobar el estado del contenedor.
    """

    logger.info("Health check ejecutado")

    return {
        "status": "OK",
        "service": "recommendation-service"
    }


@app.get(
    "/recommendations/{student_id}",
    response_model=RecommendationResponse,
    tags=["Recommendations"],
    summary="Consultar recomendaciones de un estudiante",
    description="Devuelve recomendaciones académicas asociadas a un estudiante."
)
def get_recommendations(
    # Path(..., gt=0) indica que student_id viene desde la URL
    # y debe ser mayor que 0.
    student_id: int = Path(..., gt=0)
):
    """
    Endpoint para consultar recomendaciones de un estudiante.

    En esta versión, devuelve recomendaciones base o de demostración.
    No consulta todavía recomendaciones reales guardadas en base de datos.
    """

    logger.info(
        f"Consultando recomendaciones para estudiante {student_id}"
    )

    try:
        # Validación simulada para la demo.
        # Si el ID es mayor a 1000, se considera como estudiante no encontrado.
        # En una versión real, esto debería consultarse en base de datos.
        if student_id > 1000:

            logger.warning(
                f"Estudiante {student_id} no encontrado"
            )

            raise HTTPException(
                status_code=404,
                detail="Estudiante no encontrado"
            )

        # Obtiene recomendaciones base desde la lógica del servicio.
        recommendations = get_default_recommendations(student_id)

        logger.info(
            f"Se encontraron {len(recommendations)} recomendaciones"
        )

        return {
            "studentId": student_id,
            "recommendations": recommendations
        }

    except HTTPException:
        # Si ya se generó una excepción HTTP controlada, se vuelve a lanzar.
        raise

    except Exception as e:
        # Cualquier otro error se maneja como error interno del servidor.
        logger.error(
            f"Error interno obteniendo recomendaciones: {str(e)}"
        )

        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )


@app.post(
    "/recommendations/generate",
    response_model=GenerateRecommendationResponse,
    tags=["Recommendations"],
    summary="Generar recomendación académica",
    description="Genera una recomendación a partir de un recurso completado por el estudiante."
)
def generate_student_recommendation(
    request: GenerateRecommendationRequest
):
    """
    Endpoint para generar una recomendación a partir de un recurso completado.

    Recibe datos como studentId, resourceId y resourceTitle.
    La recomendación se genera principalmente usando el título del recurso.
    """

    logger.info(
        f"Generando recomendación para estudiante "
        f"{request.studentId}"
    )

    try:
        # Valida que el título del recurso no llegue vacío.
        if not request.resourceTitle.strip():

            logger.warning(
                "resourceTitle vacío recibido"
            )

            raise HTTPException(
                status_code=400,
                detail="El título del recurso no puede estar vacío"
            )

        # Genera una recomendación según el título del recurso completado.
        # Ejemplo: si el título contiene Docker, puede recomendar Kubernetes.
        recommendation = generate_recommendation(
            request.resourceTitle
        )

        logger.info(
            f"Recomendación generada: "
            f"{recommendation.title}"
        )

        return {
            "studentId": request.studentId,
            "generatedRecommendation": recommendation
        }

    except HTTPException:
        raise

    except Exception as e:
        logger.error(
            f"Error generando recomendación: {str(e)}"
        )

        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )


# Permite ejecutar el servicio directamente con:
# python app/main.py
# En Docker normalmente se ejecuta con uvicorn.
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        reload=False
    )