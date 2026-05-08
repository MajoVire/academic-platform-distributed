package com.academicplatform.academicservice.messaging;

import static org.mockito.Mockito.verify;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import com.academicplatform.academicservice.config.AcademicRabbitProperties;

@ExtendWith(MockitoExtension.class)
class AcademicEventPublisherTest {

    @Mock
    private RabbitTemplate rabbitTemplate;

    @Test
    void shouldSendResourceCompletedEventToRabbitMq() {
        AcademicRabbitProperties properties = new AcademicRabbitProperties(
                "academic.events.exchange",
                "academic.events.queue",
                "academic.resource.completed");
        AcademicEventPublisher publisher = new AcademicEventPublisher(
                rabbitTemplate,
                properties,
                new org.springframework.amqp.core.TopicExchange(properties.exchange()));

        ResourceCompletedEvent event = ResourceCompletedEvent.of(
                1L,
                1L,
                1L,
                1L,
                "Introduccion a Docker",
                LocalDateTime.parse("2026-05-02T12:00:00"));

        publisher.publishResourceCompleted(event);

        verify(rabbitTemplate).convertAndSend(
                "academic.events.exchange",
                "academic.resource.completed",
                event);
    }
}
