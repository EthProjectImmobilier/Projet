package com.example.bookingservice.controller;

import com.example.bookingservice.dto.RiskScoreResponse;
import com.example.bookingservice.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/risk")
@RequiredArgsConstructor
public class RiskController {

    private final BookingService bookingService;

    @GetMapping("/me")
    public ResponseEntity<RiskScoreResponse> getMyTrustScore(
            @RequestHeader("X-Auth-User-Id") Long userId) {
        
        log.info("Get trust score request for user: {}", userId);
        RiskScoreResponse score = bookingService.getUserTrustScore(userId);
        return ResponseEntity.ok(score);
    }
}
