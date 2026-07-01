from datetime import datetime, timezone
from uuid import uuid4

from pydantic import BaseModel, Field


RESOURCE_COMPLETED = "RESOURCE_COMPLETED"
RECOMMENDATION_GENERATED = "RECOMMENDATION_GENERATED"


class ResourceCompletedEvent(BaseModel):
    eventType: str
    studentId: int
    subjectId: int
    courseId: int
    resourceId: int
    resourceTitle: str
    completedAt: datetime


class RecommendationPayload(BaseModel):
    title: str
    reason: str


class RecommendationGeneratedEvent(BaseModel):
    eventId: str = Field(default_factory=lambda: str(uuid4()))
    eventType: str = RECOMMENDATION_GENERATED
    studentId: int
    status: str = "GENERATED"
    message: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    subjectId: int
    courseId: int
    resourceId: int
    resourceTitle: str
    completedAt: datetime
    generatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    sourceEventType: str = RESOURCE_COMPLETED
    recommendation: RecommendationPayload


def build_recommendation_generated_event(
    resource_event: ResourceCompletedEvent,
    recommendation: RecommendationPayload,
) -> RecommendationGeneratedEvent:
    return RecommendationGeneratedEvent(
        studentId=resource_event.studentId,
        message=f"Recomendación generada: {recommendation.title}",
        subjectId=resource_event.subjectId,
        courseId=resource_event.courseId,
        resourceId=resource_event.resourceId,
        resourceTitle=resource_event.resourceTitle,
        completedAt=resource_event.completedAt,
        recommendation=recommendation,
    )
