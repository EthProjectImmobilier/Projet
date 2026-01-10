package com.propertyservice.propertyservice.dto;

import lombok.Data;

@Data
public class ReviewStatsResponse {
    private Double averageRating;
    private Integer reviewCount;
}
