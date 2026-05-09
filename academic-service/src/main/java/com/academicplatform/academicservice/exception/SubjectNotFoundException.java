package com.academicplatform.academicservice.exception;

public class SubjectNotFoundException extends RuntimeException {

    public SubjectNotFoundException(Long subjectId) {
        super("Subject not found: " + subjectId);
    }
}
