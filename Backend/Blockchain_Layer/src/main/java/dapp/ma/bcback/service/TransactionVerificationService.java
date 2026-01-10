package dapp.ma.bcback.service;

import dapp.ma.bcback.abi.Escrow;
import dapp.ma.bcback.dto.BookingPaymentVerificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.abi.EventEncoder;
import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Event;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.methods.response.EthGetTransactionReceipt;
import org.web3j.protocol.core.methods.response.Log;
import org.web3j.protocol.core.methods.response.TransactionReceipt;

import java.io.IOException;
import java.math.BigInteger;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionVerificationService {

    private final Web3j web3j;
    private final PaymentService paymentService;

    @Value("${contract.escrow-payment:}")
    private String escrowPaymentAddress;

    public BookingPaymentVerificationEvent verify(Long bookingId, String txHash, BigInteger expectedAmountInWei, Long blockchainRentalId) {
        if (bookingId == null || txHash == null || txHash.isBlank()) {
            return new BookingPaymentVerificationEvent(bookingId, txHash, false, "Invalid input");
        }
        
        // Use blockchainRentalId if provided, otherwise fallback to bookingId (for backward compatibility)
        Long rentalIdToVerify = blockchainRentalId != null ? blockchainRentalId : bookingId;
        log.info("Verifying payment for bookingId: {}, blockchainRentalId: {}, using rentalId: {}", 
                 bookingId, blockchainRentalId, rentalIdToVerify);
        
        try {
            EthGetTransactionReceipt response = web3j.ethGetTransactionReceipt(txHash).send();
            Optional<TransactionReceipt> maybeReceipt = response.getTransactionReceipt();
            if (maybeReceipt.isEmpty()) {
                return new BookingPaymentVerificationEvent(bookingId, txHash, false, "Transaction receipt not found");
            }
            TransactionReceipt receipt = maybeReceipt.get();
            String status = receipt.getStatus();
            if (status == null || !"0x1".equals(status)) {
                return new BookingPaymentVerificationEvent(bookingId, txHash, false, "Transaction status not successful");
            }
            String to = receipt.getTo();
            String configured = escrowPaymentAddress == null ? null : escrowPaymentAddress.toLowerCase();
            if (configured != null && !configured.isBlank() && to != null
                    && !to.toLowerCase().equals(configured)) {
                return new BookingPaymentVerificationEvent(bookingId, txHash, false,
                        "Transaction not sent to Escrow contract");
            }
            boolean matchedAndAmount = hasDepositMadeEventWithCorrectAmount(receipt, rentalIdToVerify, expectedAmountInWei);
            if (!matchedAndAmount) {
                return new BookingPaymentVerificationEvent(bookingId, txHash, false, "DepositMade event with matching bookingId and correct amount not found");
            }
            return new BookingPaymentVerificationEvent(bookingId, txHash, true, null);
        } catch (IOException e) {
            log.error("Error while fetching transaction receipt for hash {}", txHash, e);
            return new BookingPaymentVerificationEvent(bookingId, txHash, false, "IOException while fetching transaction receipt");
        } catch (Exception e) {
            log.error("Unexpected error while verifying transaction {}", txHash, e);
            return new BookingPaymentVerificationEvent(bookingId, txHash, false, "Unexpected error during verification");
        }
    }

    private boolean hasDepositMadeEventWithCorrectAmount(TransactionReceipt receipt, Long rentalId, BigInteger expectedAmountInWei) {
        BigInteger expectedBookingId = BigInteger.valueOf(rentalId);
        // We use the static event definition from the new Escrow class
        String signature = EventEncoder.encode(Escrow.DEPOSITMADE_EVENT);
        
        for (Log logEntry : receipt.getLogs()) {
            String addr = logEntry.getAddress();
            if (escrowPaymentAddress != null && !escrowPaymentAddress.isBlank()
                    && addr != null && !addr.toLowerCase().equals(escrowPaymentAddress.toLowerCase())) {
                continue;
            }
            List<String> topics = logEntry.getTopics();
            if (topics == null || topics.isEmpty() || !signature.equals(topics.get(0))) {
                continue;
            }

            // Manually extract for simplicity since we don't have the full generated wrapper
            try {
                // Topic 0 is signature, Topic 1 is indexed bookingId
                if (topics.size() < 2) continue;
                
                BigInteger bookingIdFromEvent = new BigInteger(topics.get(1).substring(2), 16);
                
                // Non-indexed amount is in data
                String data = logEntry.getData();
                BigInteger amountFromEvent = new BigInteger(data.substring(2), 16);

                if (!expectedBookingId.equals(bookingIdFromEvent)) {
                    continue;
                }
                
                if (expectedAmountInWei != null && !expectedAmountInWei.equals(amountFromEvent)) {
                    log.warn("Amount mismatch for booking {}: expected {}, found {}", bookingIdFromEvent, expectedAmountInWei, amountFromEvent);
                    continue;
                }
                
                return true;
            } catch (Exception e) {
                log.error("Error parsing DepositMade event from log", e);
            }
        }
        return false;
    }
}
