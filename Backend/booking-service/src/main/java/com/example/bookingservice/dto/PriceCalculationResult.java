package com.example.bookingservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceCalculationResult {
    private Long propertyId;
    private LocalDate startDate;
    private LocalDate endDate;
    private long numberOfNights;
    private BigDecimal pricePerNight;
    private BigDecimal totalPrice;
    private BigDecimal securityDeposit;
    private String currency;
    private boolean available;
    private String message;
}
