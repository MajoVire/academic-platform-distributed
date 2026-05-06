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

app = FastAPI(
    title="Recommendation Service",
    description="Servicio de recomendaciones académicas para la plataforma distribuida",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "service": "recommendation-service",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
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
    recommendations = get_default_recommendations(student_id)

    return {
        "studentId": student_id,
        "recommendations": recommendations
    }


@app.post(
    "/recommendations/generate",
    response_model=GenerateRecommendationResponse
)
def generate_student_recommendation(request: GenerateRecommendationRequest):
    recommendation = generate_recommendation(request.resourceTitle)

    return {
        "studentId": request.studentId,
        "generatedRecommendation": recommendation
    }