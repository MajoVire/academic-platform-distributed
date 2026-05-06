from fastapi import FastAPI, Path
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
    description="Servicio de recomendaciones académicas para la plataforma distribuida",
    version="1.0.0"
)


@app.get("/")
def root():
    logger.info("Endpoint raíz consultado")

    return {
        "service": "recommendation-service",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    logger.info("Health check ejecutado")

    return {
        "status": "OK",
        "service": "recommendation-service"
    }


@app.get(
    "/recommendations/{student_id}",
    response_model=RecommendationResponse
)
def get_recommendations(
    student_id: int = Path(..., gt=0)
):
    logger.info(f"Consultando recomendaciones para estudiante {student_id}")

    recommendations = get_default_recommendations(student_id)

    logger.info(f"Se encontraron {len(recommendations)} recomendaciones")

    return {
        "studentId": student_id,
        "recommendations": recommendations
    }


@app.post(
    "/recommendations/generate",
    response_model=GenerateRecommendationResponse
)
def generate_student_recommendation(request: GenerateRecommendationRequest):

    logger.info(
        f"Generando recomendación para estudiante "
        f"{request.studentId} "
        f"con recurso '{request.resourceTitle}'"
    )

    recommendation = generate_recommendation(request.resourceTitle)

    logger.info(
        f"Recomendación generada: {recommendation.title}"
    )

    return {
        "studentId": request.studentId,
        "generatedRecommendation": recommendation
    }