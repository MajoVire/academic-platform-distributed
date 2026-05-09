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
    student_id: int = Path(..., gt=0)
):

    logger.info(
        f"Consultando recomendaciones para estudiante {student_id}"
    )

    try:

        if student_id > 1000:

            logger.warning(
                f"Estudiante {student_id} no encontrado"
            )

            raise HTTPException(
                status_code=404,
                detail="Estudiante no encontrado"
            )

        recommendations = get_default_recommendations(student_id)

        logger.info(
            f"Se encontraron {len(recommendations)} recomendaciones"
        )

        return {
            "studentId": student_id,
            "recommendations": recommendations
        }

    except HTTPException:
        raise

    except Exception as e:

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

    logger.info(
        f"Generando recomendación para estudiante "
        f"{request.studentId}"
    )

    try:

        if not request.resourceTitle.strip():

            logger.warning(
                "resourceTitle vacío recibido"
            )

            raise HTTPException(
                status_code=400,
                detail="El título del recurso no puede estar vacío"
            )

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


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        reload=False
    )
