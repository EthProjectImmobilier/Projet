package com.propertyservice.propertyservice.controller;

import com.propertyservice.propertyservice.dto.BlockDatesRequest;
import com.propertyservice.propertyservice.dto.PriceCalculationResult;
import com.propertyservice.propertyservice.service.AvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/properties/{propertyId}/availability", "/internal/properties/{propertyId}/availability"})
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    @GetMapping("/check")
    public ResponseEntity<Boolean> checkAvailability(
            @PathVariable Long propertyId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        boolean isAvailable = availabilityService.isPropertyAvailable(propertyId, startDate, endDate);
        return ResponseEntity.ok(isAvailable);
    }

    @GetMapping("/unavailable-dates")
    public ResponseEntity<List<LocalDate>> getUnavailableDates(
            @PathVariable Long propertyId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {

        if (start == null) start = LocalDate.now();
        if (end == null) end = start.plusMonths(6); // Par défaut 6 mois de visibilité

        List<LocalDate> dates = availabilityService.getUnavailableDates(propertyId, start, end);
        return ResponseEntity.ok(dates);
    }

    @PostMapping("/block")
    public ResponseEntity<String> blockDates(
            @RequestHeader("X-Auth-User-Id") Long userId,
            @PathVariable Long propertyId,
            @RequestBody BlockDatesRequest request) {

        availabilityService.blockDates(propertyId, request.getDates(), userId);
        return ResponseEntity.ok("Dates blocked successfully");
    }

    @PostMapping("/unblock")
    public ResponseEntity<String> unblockDates(
            @RequestHeader("X-Auth-User-Id") Long userId,
            @PathVariable Long propertyId,
            @RequestBody BlockDatesRequest request) {

        availabilityService.unblockDates(propertyId, request.getDates(), userId);
        return ResponseEntity.ok("Dates unblocked successfully");
    }

    @PostMapping("/lock")
    public ResponseEntity<?> lockDatesForReservation(
            @RequestHeader("X-Auth-User-Id") Long userId,
            @PathVariable Long propertyId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        try {
            String lockToken = availabilityService.lockDatesForReservation(
                    propertyId, startDate, endDate, userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("lockToken", lockToken);
            response.put("message", "Dates locked for 15 minutes. Complete payment to confirm booking.");
            response.put("expiresIn", "15 minutes");
            response.put("expiresAt", LocalDateTime.now().plusMinutes(15));

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }
    }

    @PostMapping("/confirm/{lockToken}")
    public ResponseEntity<?> confirmReservation(
            @PathVariable Long propertyId,
            @PathVariable String lockToken) {

        try {
            availabilityService.confirmReservation(propertyId, lockToken);
            return ResponseEntity.ok("Reservation confirmed successfully");

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error confirming reservation: " + e.getMessage());
        }
    }

    @PostMapping("/release/{lockToken}")
    public ResponseEntity<?> releaseDates(
            @PathVariable Long propertyId,
            @PathVariable String lockToken) {

        try {
            availabilityService.releaseDates(propertyId, lockToken);
            return ResponseEntity.ok("Dates released successfully");

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error releasing dates: " + e.getMessage());
        }
    }

    @GetMapping("/price")
    public ResponseEntity<?> calculatePrice(
            @PathVariable Long propertyId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        try {
            BigDecimal totalPrice = availabilityService.calculateTotalPrice(
                    propertyId, startDate, endDate);

            long numberOfNights = ChronoUnit.DAYS.between(startDate, endDate);

            Map<String, Object> response = new HashMap<>();
            response.put("propertyId", propertyId);
            response.put("startDate", startDate);
            response.put("endDate", endDate);
            response.put("numberOfNights", numberOfNights);
            response.put("totalPrice", totalPrice);
            response.put("currency", "ETH");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/price-check")
    public ResponseEntity<?> calculatePriceWithAvailability(
            @PathVariable Long propertyId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestHeader(value = "X-Auth-User-Id", required = false) Long userId) {

        try {
            PriceCalculationResult result = availabilityService.calculatePriceWithAvailability(
                    propertyId, startDate, endDate, userId);

            return ResponseEntity.ok(result);

        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Endpoint appelé par Booking-Service (inter-service call)
     * Pour bloquer définitivement des dates après paiement blockchain confirmé
     *
     * @param propertyId ID de la propriété
     * @param startDate Date de début
     * @param endDate Date de fin
     * @param lockToken Token de verrouillage utilisé pour la transaction
     * @param blockchainTxHash Hash de la transaction Ethereum
     */
    @PostMapping("/block-confirmed")
    public ResponseEntity<?> blockDatesForConfirmedBooking(
            @PathVariable Long propertyId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam String lockToken,
            @RequestParam String blockchainTxHash) {

        try {
            availabilityService.blockDatesForBooking(propertyId, startDate, endDate, lockToken, blockchainTxHash);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "ETH Payment validated. Dates are now BOOKED.");
            response.put("propertyId", propertyId);
            response.put("txHash", blockchainTxHash);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            error.put("blockchainStatus", "Check TxHash: " + blockchainTxHash);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}
