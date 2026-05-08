package com.academicplatform.academicservice.controller;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.academicplatform.academicservice.dto.ResourceCompletionResponse;
import com.academicplatform.academicservice.service.ResourceCompletionService;

@RestController
public class StudentResourceCompletionController {

    private final ResourceCompletionService resourceCompletionService;

    public StudentResourceCompletionController(ResourceCompletionService resourceCompletionService) {
        this.resourceCompletionService = resourceCompletionService;
    }

    @PostMapping("/students/{studentId}/resources/{resourceId}/complete")
    public ResourceCompletionResponse completeResource(
            @PathVariable Long studentId,
            @PathVariable Long resourceId) {
        return resourceCompletionService.completeResource(studentId, resourceId);
    }
}
