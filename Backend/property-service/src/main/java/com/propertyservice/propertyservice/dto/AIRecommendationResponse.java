package com.propertyservice.propertyservice.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class AIRecommendationResponse {
    private BigDecimal user_budget;
    private List<Long> recommended_property_ids;
}
