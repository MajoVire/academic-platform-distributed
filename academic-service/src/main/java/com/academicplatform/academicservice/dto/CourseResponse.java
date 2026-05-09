package com.academicplatform.academicservice.dto;

import com.academicplatform.academicservice.model.Course;

public record CourseResponse(Long id, Long subjectId, String title, String description) {

    public static CourseResponse from(Course course) {
        return new CourseResponse(course.id(), course.subjectId(), course.title(), course.description());
    }
}
