package dapp.ma.bcback.listener;

import com.rabbitmq.client.Channel;
import dapp.ma.bcback.config.RabbitConfig;
import dapp.ma.bcback.dto.BookingPaymentVerificationEvent;
import dapp.ma.bcback.dto.TransactionVerificationRequest;
import dapp.ma.bcback.service.TransactionVerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class TransactionVerificationListener {

    private final TransactionVerificationService verificationService;
    private final RabbitTemplate rabbitTemplate;

    @RabbitListener(queues = RabbitConfig.TRANSACTION_VERIFICATION_QUEUE)
    public void handle(TransactionVerificationRequest request, Channel channel) throws Exception {
        try {
            BookingPaymentVerificationEvent result = verificationService.verify(
                request.getBookingId(), 
                request.getTxHash(),
                request.getExpectedAmountInWei(),
                request.getBlockchainRentalId()
            );
            if (result.isSuccess()) {
                rabbitTemplate.convertAndSend(RabbitConfig.BOOKING_EXCHANGE, RabbitConfig.BOOKING_PAYMENT_SUCCESS_ROUTING_KEY, result);
            } else {
                rabbitTemplate.convertAndSend(RabbitConfig.BOOKING_EXCHANGE, RabbitConfig.BOOKING_PAYMENT_FAILED_ROUTING_KEY, result);
            }
            // With manual acks enabled, container acks automatically when no exception is thrown.
        } catch (Exception e) {
            log.error("Error while handling transaction verification for txHash {}", request.getTxHash(), e);
            BookingPaymentVerificationEvent failed = new BookingPaymentVerificationEvent(request.getBookingId(), request.getTxHash(), false, "Listener exception");
            rabbitTemplate.convertAndSend(RabbitConfig.BOOKING_EXCHANGE, RabbitConfig.BOOKING_PAYMENT_FAILED_ROUTING_KEY, failed);
            throw e;
        }
    }
}
