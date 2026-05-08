package com.academicplatform.academicservice.messaging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import com.academicplatform.academicservice.config.AcademicRabbitProperties;

@Component
public class AcademicEventPublisher {

    private static final Logger logger = LoggerFactory.getLogger(AcademicEventPublisher.class);

    private final RabbitTemplate rabbitTemplate;
    private final AcademicRabbitProperties properties;
    private final TopicExchange academicEventsExchange;

    public AcademicEventPublisher(
            RabbitTemplate rabbitTemplate,
            AcademicRabbitProperties properties,
            TopicExchange academicEventsExchange) {
        this.rabbitTemplate = rabbitTemplate;
        this.properties = properties;
        this.academicEventsExchange = academicEventsExchange;
    }

    public void publishResourceCompleted(ResourceCompletedEvent event) {
        try {
            logger.info(
                    "Publishing {} to exchange {} on thread {}",
                    event.eventType(),
                    academicEventsExchange.getName(),
                    Thread.currentThread().getName());
            rabbitTemplate.convertAndSend(properties.exchange(), properties.routingKey(), event);
            logger.info("Published RESOURCE_COMPLETED for student {} resource {}", event.studentId(), event.resourceId());
        } catch (AmqpException exception) {
            logger.error(
                    "Failed to publish RESOURCE_COMPLETED for student {} resource {}: {}",
                    event.studentId(),
                    event.resourceId(),
                    exception.getMessage());
        }
    }
}
