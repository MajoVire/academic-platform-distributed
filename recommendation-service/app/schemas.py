from datetime import datetime
from pydantic import BaseModel
from typing import List


class Recommendation(BaseModel):
    title: str
    reason: str


class RecommendationResponse(BaseModel):
    studentId: int
    recommendations: List[Recommendation]


class GenerateRecommendationRequest(BaseModel):
    studentId: int
    subjectId: int
    courseId: int
    resourceId: int
    resourceTitle: str


class GenerateRecommendationResponse(BaseModel):
    studentId: int
    generatedRecommendation: Recommendation


class ResourceCompletedEvent(BaseModel):
    eventType: str
    studentId: int
    subjectId: int
    courseId: int
    resourceId: int
    resourceTitle: str
    completedAt: datetime
