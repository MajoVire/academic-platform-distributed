package com.academicplatform.academicservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "academic.messaging.rabbitmq")
public record AcademicRabbitProperties(String exchange, String queue, String routingKey) {
}
