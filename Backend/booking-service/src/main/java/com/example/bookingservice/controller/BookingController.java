package com.example.bookingservice.controller;

import com.example.bookingservice.dto.BookingResponse;
import com.example.bookingservice.dto.CreateBookingRequest;
import com.example.bookingservice.dto.OwnerStatsResponse;
import com.example.bookingservice.enu.BookingStatus;
import com.example.bookingservice.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @RequestHeader("X-Auth-User-Id") Long userId,
            @RequestHeader("X-Auth-Wallet-Address") String walletAddress,
            @Valid @RequestBody CreateBookingRequest request) {

        log.info("Create booking request from user: {}, wallet: {} for property: {}",
                userId, walletAddress, request.getPropertyId());

        // Validation du wallet address
        if (walletAddress == null || walletAddress.isBlank()) {
            throw new IllegalArgumentException("Wallet address is required");
        }

        BookingResponse response = bookingService.createBooking(request, userId, walletAddress);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<BookingResponse> getBooking(
            @RequestHeader("X-Auth-User-Id") Long userId,
            @PathVariable Long bookingId) {

        log.info("Get booking request for ID: {} by user: {}", bookingId, userId);

        BookingResponse response = bookingService.getBookingById(bookingId, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<List<BookingResponse>> getUserBookings(
            @RequestHeader("X-Auth-User-Id") Long userId,
            @RequestParam(required = false) BookingStatus status) {

        log.info("Get bookings for user: {} with status: {}", userId, status);

        List<BookingResponse> bookings = bookingService.getUserBookings(userId, status);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/owner")
    public ResponseEntity<List<BookingResponse>> getOwnerBookings(
            @RequestHeader("X-Auth-User-Id") Long userId,
            @RequestParam(required = false) BookingStatus status) {

        log.info("Get owner bookings for user: {} with status: {}", userId, status);

        List<BookingResponse> bookings = bookingService.getOwnerBookings(userId, status);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/owner/stats")
    public ResponseEntity<OwnerStatsResponse> getOwnerStats(
            @RequestHeader("X-Auth-User-Id") Long userId) {

        log.info("Get owner stats for user: {}", userId);

        OwnerStatsResponse stats = bookingService.getOwnerStats(userId);
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/{bookingId}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @RequestHeader("X-Auth-User-Id") Long userId,
            @PathVariable Long bookingId,
            @RequestBody(required = false) Map<String, String> request) {

        String reason = request != null ? request.get("reason") : "Cancelled by user";

        log.info("Cancel booking ID: {} by user: {} with reason: {}",
                bookingId, userId, reason);

        BookingResponse response = bookingService.cancelBooking(bookingId, userId, reason);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<BookingResponse>> getPropertyBookings(
            @RequestHeader("X-Auth-User-Id") Long userId,
            @PathVariable Long propertyId,
            @RequestParam(required = false) BookingStatus status) {

        log.info("Get bookings for property: {} by user: {} with status: {}",
                propertyId, userId, status);

        // Pour l'instant, retourner les bookings du propriétaire filtrés par propertyId
        List<BookingResponse> ownerBookings = bookingService.getOwnerBookings(userId, status);
        List<BookingResponse> propertyBookings = ownerBookings.stream()
                .filter(booking -> booking.getPropertyId().equals(propertyId))
                .toList();

        return ResponseEntity.ok(propertyBookings);
    }

    @PostMapping("/{bookingId}/confirm")
    public ResponseEntity<BookingResponse> confirmBooking(
            @RequestHeader("X-Auth-User-Id") Long userId,
            @PathVariable Long bookingId,
            @RequestBody Map<String, String> request) {

        log.info("Confirm booking request for ID: {} by user: {}", bookingId, userId);

        // Extraire le transactionHash du body
        String transactionHash = request.get("transactionHash");

        if (transactionHash == null || transactionHash.isBlank()) {
            throw new IllegalArgumentException("Transaction hash is required");
        }

        BookingResponse response = bookingService.confirmBooking(bookingId, transactionHash, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{bookingId}/confirm-payment")
    public ResponseEntity<BookingResponse> confirmPaymentAliasPost(
            @RequestHeader("X-Auth-User-Id") Long userId,
            @PathVariable Long bookingId,
            @RequestBody Map<String, String> request) {
        return confirmBooking(userId, bookingId, request);
    }

    @PutMapping("/{bookingId}/confirm-payment")
    public ResponseEntity<BookingResponse> confirmPaymentAliasPut(
            @RequestHeader("X-Auth-User-Id") Long userId,
            @PathVariable Long bookingId,
            @RequestBody Map<String, String> request) {
        return confirmBooking(userId, bookingId, request);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getBookingStats(
            @RequestHeader("X-Auth-User-Id") Long userId) {

        log.info("Get booking stats for user: {}", userId);

        // TODO: Implémenter les statistiques dans BookingService
        Map<String, Object> stats = Map.of(
                "totalBookings", 0,
                "pendingBookings", 0,
                "confirmedBookings", 0,
                "cancelledBookings", 0,
                "revenue", 0.0
        );

        return ResponseEntity.ok(stats);
    }
}
