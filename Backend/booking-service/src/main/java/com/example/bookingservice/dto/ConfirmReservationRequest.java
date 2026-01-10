package com.example.bookingservice.dto;

import lombok.Data;

@Data
public class ConfirmReservationRequest {
    private String lockToken;
}
