package com.academicplatform.academicservice.dto;

import java.time.LocalDateTime;

import com.academicplatform.academicservice.model.Course;
import com.academicplatform.academicservice.model.Resource;
import com.academicplatform.academicservice.model.StudentProgress;
import com.academicplatform.academicservice.model.Subject;

public record ResourceCompletionResponse(
        Long studentId,
        Long subjectId,
        Long courseId,
        Long resourceId,
        String resourceTitle,
        boolean newlyCompleted,
        int totalCompletedResources,
        LocalDateTime completedAt) {

    public static ResourceCompletionResponse from(
            Long studentId,
            StudentProgress progress,
            Subject subject,
            Course course,
            Resource resource,
            boolean newlyCompleted,
            LocalDateTime completedAt) {
        return new ResourceCompletionResponse(
                studentId,
                subject.id(),
                course.id(),
                resource.id(),
                resource.title(),
                newlyCompleted,
                progress.totalCompletedResources(),
                completedAt
        );
    }
}
