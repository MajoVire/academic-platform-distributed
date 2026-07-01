package com.academicplatform.academicservice.model;

import java.time.LocalDateTime;

public record Enrollment(
    Long id,
    Long studentId,
    Long courseId,
    LocalDateTime enrolledAt
) {}
