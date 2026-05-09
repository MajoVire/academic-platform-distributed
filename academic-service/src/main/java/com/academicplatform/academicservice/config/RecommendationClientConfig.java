package com.academicplatform.academicservice.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
@EnableConfigurationProperties(RecommendationServiceProperties.class)
public class RecommendationClientConfig {

    @Bean
    public RestTemplate recommendationServiceRestTemplate(
            RestTemplateBuilder builder,
            RecommendationServiceProperties properties) {
        return builder
                .rootUri(properties.url())
                .build();
    }
}
