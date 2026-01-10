package dapp.ma.bcback.config;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    public static final String BOOKING_EXCHANGE = "booking.exchange";
    public static final String TRANSACTION_VERIFICATION_QUEUE = "q.transaction-verification";
    public static final String TRANSACTION_VERIFICATION_ROUTING_KEY = "TRANSACTION_VERIFICATION";
    public static final String BOOKING_PAYMENT_SUCCESS_ROUTING_KEY = "PAYMENT_SUCCESS";
    public static final String BOOKING_PAYMENT_FAILED_ROUTING_KEY = "PAYMENT_FAILED";
    public static final String BOOKING_PAYMENT_COMPLETED_ROUTING_KEY = "PAYMENT_COMPLETED";

    @Bean
    public TopicExchange bookingExchange() {
        return new TopicExchange(BOOKING_EXCHANGE);
    }

    @Bean
    public Queue transactionVerificationQueue() {
        return new Queue(TRANSACTION_VERIFICATION_QUEUE, true);
    }

    @Bean
    public Binding transactionVerificationBinding() {
        return BindingBuilder
                .bind(transactionVerificationQueue())
                .to(bookingExchange())
                .with(TRANSACTION_VERIFICATION_ROUTING_KEY);
    }

}
