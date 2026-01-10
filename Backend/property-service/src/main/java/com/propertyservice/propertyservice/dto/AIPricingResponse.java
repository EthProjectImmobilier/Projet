package com.propertyservice.propertyservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AIPricingResponse {
    private Long property_id;
    private String requested_date;
    private BigDecimal suggested_price_eth;
    private BigDecimal original_price_eth;
    private Double percent_increase;
    private String comparison_info;
    private String explanation;
}
