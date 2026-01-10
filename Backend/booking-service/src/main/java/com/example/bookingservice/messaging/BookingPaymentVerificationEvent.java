package com.example.bookingservice.messaging;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingPaymentVerificationEvent {
    private Long bookingId;
    private String txHash;
    private boolean success;
    private String reason;
}
