package com.example.bookingservice.messaging;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionVerificationRequest {
    private Long bookingId;
    private String txHash;
    private BigInteger expectedAmountInWei;
}
