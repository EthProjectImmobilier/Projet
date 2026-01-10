package com.example.notificationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyApprovalEvent {
    private Long propertyId;
    private String status; // ACTIVE, REJECTED
    private String reason;
}
