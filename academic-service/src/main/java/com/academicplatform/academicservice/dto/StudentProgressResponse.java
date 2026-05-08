package com.academicplatform.academicservice.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.academicplatform.academicservice.model.StudentProgress;

public record StudentProgressResponse(Long studentId, List<Long> completedResourceIds, int totalCompletedResources, LocalDateTime lastCompletedAt) {

    public static StudentProgressResponse from(StudentProgress progress) {
        return new StudentProgressResponse(
                progress.studentId(),
                progress.completedResourceIds(),
                progress.totalCompletedResources(),
                progress.lastCompletedAt()
        );
    }
}
