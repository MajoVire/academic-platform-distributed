package com.academicplatform.academicservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "recommendation.service")
public record RecommendationServiceProperties(String url) {
}
