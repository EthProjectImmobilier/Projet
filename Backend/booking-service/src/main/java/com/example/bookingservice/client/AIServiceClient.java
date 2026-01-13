package com.example.bookingservice.client;

import com.example.bookingservice.dto.RiskScoreResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "ai-service", url = "${app.services.ai-service-url:http://localhost:8000}")
public interface AIServiceClient {

    @GetMapping("/api/v1/risk/score/{userId}")
    RiskScoreResponse getRiskScore(
            @PathVariable("userId") Long userId,
            @RequestParam("cancel_count") int cancelCount,
            @RequestParam("bad_reviews") int badReviews,
            @RequestParam("wallet_verified") boolean walletVerified
    );
}
