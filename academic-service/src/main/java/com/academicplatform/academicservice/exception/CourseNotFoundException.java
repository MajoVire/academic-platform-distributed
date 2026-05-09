package com.academicplatform.academicservice.exception;

public class CourseNotFoundException extends RuntimeException {

    public CourseNotFoundException(Long courseId) {
        super("Course not found: " + courseId);
    }
}
