package com.example.bookingservice.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateBookingRequest {

    @NotNull(message = "Property ID is required")
    private Long propertyId;

    @NotNull(message = "Check-in date is required")
    @FutureOrPresent(message = "Check-in date must be today or in the future")
    private LocalDate checkIn;

    @NotNull(message = "Check-out date is required")
    @Future(message = "Check-out date must be in the future")
    private LocalDate checkOut;

    @Min(value = 1, message = "At least 1 guest is required")
    @Max(value = 20, message = "Maximum 20 guests allowed")
    private Integer numberOfGuests;

    private BigDecimal totalPrice;

    private BigDecimal securityDeposit;

    private String lockToken; // From property-service lock endpoint
}
