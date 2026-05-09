package com.academicplatform.academicservice.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(AcademicRabbitProperties.class)
public class RabbitMqConfig {

    @Bean
    public TopicExchange academicEventsExchange(AcademicRabbitProperties properties) {
        return new TopicExchange(properties.exchange(), true, false);
    }

    @Bean
    public Queue academicEventsQueue(AcademicRabbitProperties properties) {
        return new Queue(properties.queue(), true);
    }

    @Bean
    public Binding academicEventsBinding(
            Queue academicEventsQueue,
            TopicExchange academicEventsExchange,
            AcademicRabbitProperties properties) {
        return BindingBuilder.bind(academicEventsQueue)
                .to(academicEventsExchange)
                .with(properties.routingKey());
    }

    @Bean
    public MessageConverter jackson2JsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter messageConverter) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(messageConverter);
        return rabbitTemplate;
    }
}
