package com.academicplatform.academicservice.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.academicplatform.academicservice.dto.StudentRecommendationsResponse;
import com.academicplatform.academicservice.service.StudentRecommendationService;

@RestController
@RequestMapping("/api/students")
public class StudentRecommendationController {

    private final StudentRecommendationService studentRecommendationService;

    public StudentRecommendationController(StudentRecommendationService studentRecommendationService) {
        this.studentRecommendationService = studentRecommendationService;
    }

    @GetMapping("/{studentId}/recommendations")
    public StudentRecommendationsResponse getRecommendations(@PathVariable Long studentId) {
        return studentRecommendationService.getRecommendations(studentId);
    }
}
