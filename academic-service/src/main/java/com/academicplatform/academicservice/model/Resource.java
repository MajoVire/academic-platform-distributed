package com.academicplatform.academicservice.model;

public record Resource(Long id, Long courseId, String title, String description, String type) {
}
