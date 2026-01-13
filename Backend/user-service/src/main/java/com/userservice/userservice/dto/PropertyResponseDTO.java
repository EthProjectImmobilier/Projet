package com.userservice.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyResponseDTO {
    private Long id;
    private String title;
    private String description;
    private String type;
    private BigDecimal pricePerNight;
    private String status;
    private List<String> amenities;
}
