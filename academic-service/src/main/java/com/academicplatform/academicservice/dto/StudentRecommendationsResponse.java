package com.academicplatform.academicservice.dto;

import java.util.List;

public record StudentRecommendationsResponse(Long studentId, List<RecommendationItemResponse> recommendations) {

    public static StudentRecommendationsResponse empty(Long studentId) {
        return new StudentRecommendationsResponse(studentId, List.of());
    }
}
