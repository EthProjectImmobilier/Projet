package com.example.bookingservice.config;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    public static final String BOOKING_EXCHANGE = "booking.exchange";
    public static final String TRANSACTION_VERIFICATION_ROUTING_KEY = "TRANSACTION_VERIFICATION";
    public static final String BOOKING_PAYMENT_STATUS_QUEUE = "q.booking-payment-status";
    public static final String PAYMENT_SUCCESS_ROUTING_KEY = "PAYMENT_SUCCESS";
    public static final String PAYMENT_FAILED_ROUTING_KEY = "PAYMENT_FAILED";
    public static final String PAYMENT_COMPLETED_ROUTING_KEY = "PAYMENT_COMPLETED";
    public static final String BOOKING_CANCELLED_ROUTING_KEY = "BOOKING_CANCELLED";

    @Bean
    public TopicExchange bookingExchange() {
        return new TopicExchange(BOOKING_EXCHANGE);
    }

    @Bean
    public Queue bookingPaymentStatusQueue() {
        return new Queue(BOOKING_PAYMENT_STATUS_QUEUE, true);
    }

    @Bean
    public Binding bookingPaymentSuccessBinding() {
        return BindingBuilder
                .bind(bookingPaymentStatusQueue())
                .to(bookingExchange())
                .with(PAYMENT_SUCCESS_ROUTING_KEY);
    }

    @Bean
    public Binding bookingPaymentFailedBinding() {
        return BindingBuilder
                .bind(bookingPaymentStatusQueue())
                .to(bookingExchange())
                .with(PAYMENT_FAILED_ROUTING_KEY);
    }

    @Bean
    public Binding bookingPaymentCompletedBinding() {
        return BindingBuilder
                .bind(bookingPaymentStatusQueue())
                .to(bookingExchange())
                .with(PAYMENT_COMPLETED_ROUTING_KEY);
    }
}
