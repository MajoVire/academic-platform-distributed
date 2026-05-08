package com.academicplatform.academicservice.service;

import org.springframework.stereotype.Service;

import com.academicplatform.academicservice.client.RecommendationServiceClient;
import com.academicplatform.academicservice.dto.StudentRecommendationsResponse;

@Service
public class StudentRecommendationService {

    private final RecommendationServiceClient recommendationServiceClient;

    public StudentRecommendationService(RecommendationServiceClient recommendationServiceClient) {
        this.recommendationServiceClient = recommendationServiceClient;
    }

    public StudentRecommendationsResponse getRecommendations(Long studentId) {
        return recommendationServiceClient.getRecommendations(studentId);
    }
}
