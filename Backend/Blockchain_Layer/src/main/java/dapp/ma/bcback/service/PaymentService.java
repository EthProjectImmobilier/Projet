package dapp.ma.bcback.service;

import dapp.ma.bcback.abi.Escrow;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.protocol.Web3j;
import org.web3j.tx.ClientTransactionManager;
import org.web3j.tx.gas.DefaultGasProvider;

import java.math.BigInteger;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final Web3j web3j;

    @Value("${contract.escrow-payment:}")
    private String escrowPaymentAddress;

    private volatile Escrow escrow;

    private Escrow contract() {
        if (escrow == null) {
            synchronized (this) {
                if (escrow == null) {
                    String addr = escrowPaymentAddress == null ? null : escrowPaymentAddress.toLowerCase();
                    if (addr == null || addr.isBlank()) {
                        throw new IllegalStateException("Escrow contract address not configured");
                    }
                    ClientTransactionManager tm = new ClientTransactionManager(web3j, "0x0000000000000000000000000000000000000000");
                    escrow = Escrow.load(addr, web3j, tm, new DefaultGasProvider());
                    log.info("Escrow contract loaded at {}", addr);
                }
            }
        }
        return escrow;
    }

    public BigInteger getEscrowBalance(BigInteger bookingId) {
        try {
            return contract().bookingBalances(bookingId).send();
        } catch (Exception e) {
            log.error("Failed to read escrow balance for bookingId {}", bookingId, e);
            throw new RuntimeException("Failed to read escrow balance", e);
        }
    }
}
