package com.example.bookingservice.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
public class OwnerStatsResponse {
    private long totalBookings;
    private long activeBookings;
    private long pendingBookings;
    private long confirmedBookings;
    private long cancelledBookings;
    private BigDecimal totalRevenue;
    private Map<String, Long> bookingsByStatus;
}
