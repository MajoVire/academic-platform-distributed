package com.academicplatform.academicservice.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.academicplatform.academicservice.dto.StudentRecommendationsResponse;

@Component
public class PythonRecommendationServiceClient implements RecommendationServiceClient {

    private static final Logger logger = LoggerFactory.getLogger(PythonRecommendationServiceClient.class);

    private final RestTemplate recommendationServiceRestTemplate;

    public PythonRecommendationServiceClient(RestTemplate recommendationServiceRestTemplate) {
        this.recommendationServiceRestTemplate = recommendationServiceRestTemplate;
    }

    @Override
    public StudentRecommendationsResponse getRecommendations(Long studentId) {
        try {
            ResponseEntity<StudentRecommendationsResponse> response = recommendationServiceRestTemplate.exchange(
                    "/recommendations/{studentId}",
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<>() {
                    },
                    studentId);

            StudentRecommendationsResponse body = response.getBody();
            if (body == null) {
                logger.warn("Recommendation service returned an empty body for student {}", studentId);
                return StudentRecommendationsResponse.empty(studentId);
            }

            return body;
        } catch (RestClientException exception) {
            logger.warn(
                    "Recommendation service unavailable for student {} on thread {}: {}",
                    studentId,
                    Thread.currentThread().getName(),
                    exception.getMessage());
            return StudentRecommendationsResponse.empty(studentId);
        }
    }
}
