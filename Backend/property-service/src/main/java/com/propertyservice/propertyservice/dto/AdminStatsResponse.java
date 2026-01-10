package com.propertyservice.propertyservice.dto;

import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data
@Builder
public class AdminStatsResponse {
    private long totalProperties;
    private long activeProperties;
    private long pendingProperties;
    private long rejectedProperties;
    private long totalReviews;
    private Map<String, Long> propertiesByType;
}
