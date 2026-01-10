package com.propertyservice.propertyservice.controller;

import com.propertyservice.propertyservice.dto.CreateReviewRequest;
import com.propertyservice.propertyservice.dto.ReviewResponse;
import com.propertyservice.propertyservice.dto.ReviewStatsResponse;
import com.propertyservice.propertyservice.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/properties/{propertyId}/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(
            @RequestHeader("X-Auth-User-Id") Long userId,
            @PathVariable Long propertyId,
            @Valid @RequestBody CreateReviewRequest request) {

        ReviewResponse response = reviewService.createReview(
                propertyId, request.getRating(), request.getComment(), userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<ReviewResponse>> getPropertyReviews(
            @PathVariable Long propertyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ReviewResponse> response = reviewService.getPropertyReviews(propertyId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats")
    public ResponseEntity<ReviewStatsResponse> getPropertyReviewStats(
            @PathVariable Long propertyId) {

        Double averageRating = reviewService.getPropertyAverageRating(propertyId);
        Integer reviewCount = reviewService.getPropertyReviewCount(propertyId);

        ReviewStatsResponse stats = new ReviewStatsResponse();
        stats.setAverageRating(averageRating != null ? averageRating : 0.0);
        stats.setReviewCount(reviewCount);

        return ResponseEntity.ok(stats);
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(
            @RequestHeader("X-Auth-User-Id") Long userId,
            @PathVariable Long reviewId) {

        reviewService.deleteReview(reviewId, userId);
        return ResponseEntity.ok("Review deleted successfully");
    }

    @GetMapping("/me")
    public ResponseEntity<Page<ReviewResponse>> getMyReviews(
            @RequestHeader("X-Auth-User-Id") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ReviewResponse> response = reviewService.getUserReviews(userId, pageable);
        return ResponseEntity.ok(response);
    }
}
