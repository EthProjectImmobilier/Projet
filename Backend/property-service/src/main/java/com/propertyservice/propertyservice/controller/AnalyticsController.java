package com.propertyservice.propertyservice.controller;

import com.propertyservice.propertyservice.service.AIService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AIService aiService;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getMarketDashboard() {
        Object trends = aiService.getMarketTrends();
        if (trends == null) {
            return ResponseEntity.status(503).body("Market Analysis Service Unavailable");
        }
        return ResponseEntity.ok(trends);
    }
}
