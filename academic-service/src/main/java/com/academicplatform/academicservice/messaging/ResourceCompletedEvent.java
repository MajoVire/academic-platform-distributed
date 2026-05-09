package com.academicplatform.academicservice.messaging;

import java.time.LocalDateTime;

public record ResourceCompletedEvent(
        String eventType,
        Long studentId,
        Long subjectId,
        Long courseId,
        Long resourceId,
        String resourceTitle,
        LocalDateTime completedAt) {

    public static ResourceCompletedEvent of(
            Long studentId,
            Long subjectId,
            Long courseId,
            Long resourceId,
            String resourceTitle,
            LocalDateTime completedAt) {
        return new ResourceCompletedEvent(
                "RESOURCE_COMPLETED",
                studentId,
                subjectId,
                courseId,
                resourceId,
                resourceTitle,
                completedAt);
    }
}
