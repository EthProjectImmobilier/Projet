package com.propertyservice.propertyservice.controller;

import com.propertyservice.propertyservice.dto.ReviewResponse;
import com.propertyservice.propertyservice.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
public class AdminReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<?> getAllReviews(
            @RequestHeader(value = "X-Auth-Roles", defaultValue = "") String roles,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        if (!roles.contains("ROLE_ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Admin role required");
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ReviewResponse> response = reviewService.getAllReviews(pageable);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(
            @RequestHeader(value = "X-Auth-Roles", defaultValue = "") String roles,
            @PathVariable Long id) {

        if (!roles.contains("ROLE_ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Admin role required");
        }

        reviewService.adminDeleteReview(id);
        return ResponseEntity.ok("Review deleted by admin");
    }
}
