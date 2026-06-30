package com.academicplatform.academicservice.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.academicplatform.academicservice.dto.CourseResponse;
import com.academicplatform.academicservice.dto.ResourceCompletionResponse;
import com.academicplatform.academicservice.dto.ResourceResponse;
import com.academicplatform.academicservice.dto.SubjectResponse;
import com.academicplatform.academicservice.service.AcademicCatalogService;
import com.academicplatform.academicservice.service.ResourceCompletionService;

@RestController
@RequestMapping("/api")
public class AcademicCatalogController {

    private final AcademicCatalogService academicCatalogService;
    private final ResourceCompletionService resourceCompletionService;

    public AcademicCatalogController(
            AcademicCatalogService academicCatalogService,
            ResourceCompletionService resourceCompletionService) {
        this.academicCatalogService = academicCatalogService;
        this.resourceCompletionService = resourceCompletionService;
    }

    @GetMapping("/subjects")
    public List<SubjectResponse> getSubjects() {
        return academicCatalogService.findAllSubjects();
    }

    @GetMapping("/subjects/{subjectId}/courses")
    public List<CourseResponse> getCoursesBySubject(@PathVariable Long subjectId) {
        return academicCatalogService.findCoursesBySubjectId(subjectId);
    }

    @GetMapping("/courses/{courseId}/resources")
    public List<ResourceResponse> getResourcesByCourse(@PathVariable Long courseId) {
        return academicCatalogService.findResourcesByCourseId(courseId);
    }

    @PostMapping("/students/{studentId}/resources/{resourceId}/complete")
    public ResourceCompletionResponse completeResource(
            @PathVariable Long studentId,
            @PathVariable Long resourceId) {
        return resourceCompletionService.completeResource(studentId, resourceId);
    }

    @GetMapping("/catalog/resources/count")
    public long getCatalogResourceCount() {
        return academicCatalogService.countAllResources();
    }
}
