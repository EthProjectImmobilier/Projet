package dapp.ma.bcback.service;

import dapp.ma.bcback.abi.Escrow;
import dapp.ma.bcback.dto.BookingPaymentVerificationEvent;
import io.reactivex.disposables.Disposable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.tx.ClientTransactionManager;
import org.web3j.tx.gas.DefaultGasProvider;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

import java.math.BigInteger;

import static dapp.ma.bcback.config.RabbitConfig.BOOKING_EXCHANGE;
import static dapp.ma.bcback.config.RabbitConfig.BOOKING_PAYMENT_SUCCESS_ROUTING_KEY;

@Slf4j
@Service
@RequiredArgsConstructor
public class BlockchainEventListener {

    private final Web3j web3j;
    private static final String BOOKING_PAYMENT_COMPLETED_ROUTING_KEY = "PAYMENT_COMPLETED";
    private final RabbitTemplate rabbitTemplate;

    @Value("${contract.escrow-payment:}")
    private String escrowPaymentAddress;

    private Escrow escrow;
    private Disposable depositSub;
    private Disposable releaseSub;

    @PostConstruct
    public void start() {
        try {
            String addr = escrowPaymentAddress == null ? null : escrowPaymentAddress.toLowerCase();
            if (addr == null || addr.isBlank()) {
                log.warn("Escrow address not configured. BlockchainEventListener disabled.");
                return;
            }
            this.escrow = Escrow.load(addr, web3j, new ClientTransactionManager(web3j, "0x0000000000000000000000000000000000000000"), new DefaultGasProvider());

            this.depositSub = escrow.depositMadeEventFlowable(DefaultBlockParameterName.LATEST, DefaultBlockParameterName.LATEST)
                    .subscribe(evt -> onDepositMade(evt.bookingId, evt.amount, evt.log.getTransactionHash()),
                            err -> log.error("DepositMade flow error", err));

            this.releaseSub = escrow.fundsReleasedEventFlowable(DefaultBlockParameterName.LATEST, DefaultBlockParameterName.LATEST)
                    .subscribe(evt -> onDepositReleased(evt.bookingId, evt.amount, evt.to, evt.log.getTransactionHash()),
                            err -> log.error("FundsReleased flow error", err));

            log.info("BlockchainEventListener started for Escrow at {}", addr);
        } catch (Exception e) {
            log.error("Failed to start BlockchainEventListener", e);
        }
    }

    private void onDepositMade(BigInteger bookingId, BigInteger amount, String txHash) {
        Long bid = safeToLong(bookingId);
        log.info("DepositMade detected for booking {} amount {} wei tx {}", bid, amount, txHash);
        BookingPaymentVerificationEvent event = new BookingPaymentVerificationEvent(bid, txHash, true, null);
        trySend(BOOKING_EXCHANGE, BOOKING_PAYMENT_SUCCESS_ROUTING_KEY, event);
    }

    private void onDepositReleased(BigInteger bookingId, BigInteger amount, String to, String txHash) {
        Long bid = safeToLong(bookingId);
        String toLc = to == null ? null : to.toLowerCase();
        log.info("FundsReleased detected for booking {} amount {} wei to {} tx {}", bid, amount, toLc, txHash);
        BookingPaymentVerificationEvent event = new BookingPaymentVerificationEvent(bid, txHash, true, null);
        trySend(BOOKING_EXCHANGE, BOOKING_PAYMENT_COMPLETED_ROUTING_KEY, event);
    }

    private void trySend(String exchange, String routingKey, Object payload) {
        try {
            rabbitTemplate.convertAndSend(exchange, routingKey, payload);
        } catch (Exception e) {
            log.error("Failed to publish event to {}:{} - {}", exchange, routingKey, String.valueOf(payload), e);
        }
    }

    private Long safeToLong(BigInteger value) {
        if (value == null) return null;
        if (value.bitLength() > 63) {
            return Long.MAX_VALUE;
        }
        return value.longValue();
    }

    @PreDestroy
    public void stop() {
        if (depositSub != null && !depositSub.isDisposed()) {
            depositSub.dispose();
        }
        if (releaseSub != null && !releaseSub.isDisposed()) {
            releaseSub.dispose();
        }
        log.info("BlockchainEventListener stopped");
    }
}
