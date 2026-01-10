package com.propertyservice.propertyservice.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PropertyImageResponse {
    private Long id;
    private String imageUrl;
    private String caption;
    private Integer displayOrder;
    private LocalDateTime createdAt;
}
