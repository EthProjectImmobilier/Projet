package com.propertyservice.propertyservice.controller;

import com.propertyservice.propertyservice.dto.AdminStatsResponse;
import com.propertyservice.propertyservice.dto.PropertyResponse;
import com.propertyservice.propertyservice.enu.ListingStatus;
import com.propertyservice.propertyservice.service.AdminPropertyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/properties")
@RequiredArgsConstructor
public class AdminPropertyController {

    private final AdminPropertyService adminPropertyService;

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(
            @RequestHeader(value = "X-Auth-Roles", defaultValue = "") String roles) {

        if (!roles.contains("ROLE_ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Admin role required");
        }

        AdminStatsResponse response = adminPropertyService.getStats();
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<?> getAllProperties(
            @RequestHeader(value = "X-Auth-Roles", defaultValue = "") String roles,
            @RequestParam(required = false) ListingStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        if (!roles.contains("ROLE_ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Admin role required");
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<PropertyResponse> response = adminPropertyService.getAllProperties(status, pageable);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProperty(
            @RequestHeader(value = "X-Auth-Roles", defaultValue = "") String roles,
            @PathVariable Long id) {

        if (!roles.contains("ROLE_ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Admin role required");
        }

        adminPropertyService.deleteProperty(id);
        return ResponseEntity.ok("Property deleted by admin");
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveProperty(
            @RequestHeader(value = "X-Auth-Roles", defaultValue = "") String roles,
            @PathVariable Long id) {

        if (!roles.contains("ROLE_ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Admin role required");
        }

        PropertyResponse response = adminPropertyService.approveProperty(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectProperty(
            @RequestHeader(value = "X-Auth-Roles", defaultValue = "") String roles,
            @PathVariable Long id,
            @RequestParam String reason) {

        if (!roles.contains("ROLE_ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Admin role required");
        }

        PropertyResponse response = adminPropertyService.rejectProperty(id, reason);
        return ResponseEntity.ok(response);
    }
}
