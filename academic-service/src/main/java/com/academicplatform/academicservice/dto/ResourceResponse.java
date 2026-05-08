package com.academicplatform.academicservice.dto;

import com.academicplatform.academicservice.model.Resource;

public record ResourceResponse(Long id, Long courseId, String title, String description, String type) {

    public static ResourceResponse from(Resource resource) {
        return new ResourceResponse(resource.id(), resource.courseId(), resource.title(), resource.description(), resource.type());
    }
}
