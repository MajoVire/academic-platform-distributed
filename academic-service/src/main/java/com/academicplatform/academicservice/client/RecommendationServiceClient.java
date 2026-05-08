package com.academicplatform.academicservice.client;

import com.academicplatform.academicservice.dto.StudentRecommendationsResponse;

public interface RecommendationServiceClient {

    StudentRecommendationsResponse getRecommendations(Long studentId);
}
