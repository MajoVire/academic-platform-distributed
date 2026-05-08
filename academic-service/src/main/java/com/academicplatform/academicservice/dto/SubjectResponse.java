package com.academicplatform.academicservice.dto;

import com.academicplatform.academicservice.model.Subject;

public record SubjectResponse(Long id, String name, String description) {

    public static SubjectResponse from(Subject subject) {
        return new SubjectResponse(subject.id(), subject.name(), subject.description());
    }
}
