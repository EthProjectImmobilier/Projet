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
    private BigDecimal suggested_price_eth;
    private String yield_improvement;
    private String note;
}
