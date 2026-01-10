package dapp.ma.bcback.controller;

import dapp.ma.bcback.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigInteger;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/bc/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final dapp.ma.bcback.service.TransactionVerificationService verificationService;
    private final org.springframework.amqp.rabbit.core.RabbitTemplate rabbitTemplate;

    @GetMapping("/{rentalId}/balance")
    public BigInteger getEscrowBalance(@PathVariable("rentalId") BigInteger rentalId) {
        return paymentService.getEscrowBalance(rentalId);
    }

    @org.springframework.web.bind.annotation.PostMapping("/{bookingId}/verify")
    public org.springframework.http.ResponseEntity<String> verifyPayment(
            @PathVariable Long bookingId, 
            @org.springframework.web.bind.annotation.RequestParam String txHash,
            @org.springframework.web.bind.annotation.RequestParam(required = false) BigInteger expectedAmountInWei,
            @org.springframework.web.bind.annotation.RequestParam(required = false) Long blockchainRentalId) {
        
        log.info("Verifying payment for booking {} with hash {} expectedAmount {} blockchainRentalId {}", 
                 bookingId, txHash, expectedAmountInWei, blockchainRentalId);
        var result = verificationService.verify(bookingId, txHash, expectedAmountInWei, blockchainRentalId);
        
        String routingKey = result.isSuccess() ? 
            dapp.ma.bcback.config.RabbitConfig.BOOKING_PAYMENT_SUCCESS_ROUTING_KEY : 
            dapp.ma.bcback.config.RabbitConfig.BOOKING_PAYMENT_FAILED_ROUTING_KEY;
            
        rabbitTemplate.convertAndSend(dapp.ma.bcback.config.RabbitConfig.BOOKING_EXCHANGE, routingKey, result);
        
        if (result.isSuccess()) {
            return org.springframework.http.ResponseEntity.ok("Verified");
        } else {
            return org.springframework.http.ResponseEntity.badRequest().body("Verification failed: " + result.getReason());
        }
    }
}
