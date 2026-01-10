package com.example.notificationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingDTO {
    private Long id;
    private Long tenantId;
    private Long propertyId;
    private Long ownerId; // Ajout de l'ownerId
    private String status;
}
