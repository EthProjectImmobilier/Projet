package com.example.bookingservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RiskScoreResponse {
    private Long userId;
    private int score;
    private String risk_level;
}
