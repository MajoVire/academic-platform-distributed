package com.academicplatform.academicservice.model;

import java.time.LocalDateTime;

public record AcademicActivity(
        Long studentId,
        Long resourceId,
        String resourceTitle,
        LocalDateTime completedAt,
        String threadName) {
}
