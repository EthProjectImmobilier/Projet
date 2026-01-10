package com.example.bookingservice.dto;

import com.example.bookingservice.enu.BookingStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Data
@Builder
public class BookingResponse {
    private Long id;
    private Long propertyId;
    private Long tenantId;
    private String tenantWalletAddress;
    private Long ownerId;
    private String ownerWalletAddress;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private Integer numberOfGuests;
    private BigDecimal totalPrice;
    private BigDecimal securityDeposit;
    private BookingStatus status;
    private String lockToken;
    private String paymentTxHash;
    private Long blockchainRentalId;
    private String cancellationReason;
    private LocalDateTime createdAt;
    private LocalDateTime confirmedAt;
    private LocalDateTime cancelledAt;
    private LocalDateTime completedAt;
    private LocalDateTime paymentConfirmedAt;

    // Calculé
    private Integer numberOfNights;

    // Hydraté depuis d'autres services
    private String propertyTitle;
    private String propertyAddress;
    private String tenantName;
    private String ownerName;

    public Integer getNumberOfNights() {
        if (checkIn != null && checkOut != null) {
            return (int) ChronoUnit.DAYS.between(checkIn, checkOut);
        }
        return 0;
    }
}
