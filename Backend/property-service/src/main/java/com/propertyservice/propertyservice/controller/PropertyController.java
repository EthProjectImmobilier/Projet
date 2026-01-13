package com.propertyservice.propertyservice.controller;

import com.propertyservice.propertyservice.dto.CreatePropertyRequest;
import com.propertyservice.propertyservice.dto.PropertyResponse;
import com.propertyservice.propertyservice.dto.SearchRequest;
import com.propertyservice.propertyservice.dto.SearchResponse;
import com.propertyservice.propertyservice.service.PropertyService;
import com.propertyservice.propertyservice.service.SearchService;
import com.propertyservice.propertyservice.service.AIService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.propertyservice.propertyservice.enu.ListingStatus;

@RestController
@RequestMapping({"/api/properties", "/internal/properties"})
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService propertyService;
    private final SearchService searchService;
    private final AIService aiService;
    private final com.propertyservice.propertyservice.service.FileStorageService fileStorageService;

    @PostMapping
    public ResponseEntity<?> createProperty(
            @RequestHeader("X-Auth-User-Id") Long userId,
            @RequestHeader("X-Auth-Wallet-Address") String walletAddress,
            @RequestHeader(value = "X-Auth-Roles", defaultValue = "") String roles,
            @Valid @RequestBody CreatePropertyRequest request) {

        List<String> roleList = java.util.Arrays.asList(roles.split(","));
        PropertyResponse response = propertyService.createProperty(request, userId, walletAddress, roleList);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PropertyResponse> getProperty(
            @RequestHeader(value = "X-Auth-User-Id", required = false) Long userId,
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        PropertyResponse response = propertyService.getPropertyById(id, userId);
        
        // AI Integration: Suggest price for a specific date if provided (default today)
        LocalDate targetDate = (date != null) ? date : LocalDate.now();
        BigDecimal suggestedPrice = aiService.getSuggestedPrice(id, targetDate);
        response.setSuggestedPricePerNight(suggestedPrice);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<Page<PropertyResponse>> getMyProperties(
            @RequestHeader("X-Auth-User-Id") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<PropertyResponse> response = propertyService.getPropertiesByOwner(userId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<PropertyResponse>> getPropertiesByOwnerInternal(@PathVariable Long ownerId) {
        List<PropertyResponse> response = propertyService.getPropertiesByOwnerList(ownerId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Page<PropertyResponse>> getAvailableProperties(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<PropertyResponse> response = propertyService.getAvailableProperties(pageable);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PropertyResponse> updateProperty(
            @RequestHeader("X-Auth-User-Id") Long userId,
            @PathVariable Long id,
            @Valid @RequestBody CreatePropertyRequest request) {

        PropertyResponse response = propertyService.updateProperty(id, request, userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProperty(
            @RequestHeader("X-Auth-User-Id") Long userId,
            @PathVariable Long id) {

        propertyService.deleteProperty(id, userId);
        return ResponseEntity.ok("Property deleted successfully");
    }

    @GetMapping("/search")
    public ResponseEntity<SearchResponse> searchProperties(
            @ModelAttribute @Valid SearchRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction) {

        // SIMPLIFIER : Ne pas utiliser request.getSortBy() pour l'instant
        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc")
                ? Sort.Direction.ASC : Sort.Direction.DESC;

        // Choisir le champ de tri
        String sortField = sort;
        if ("price".equals(sort)) {
            sortField = "pricePerNight";
        }

        Sort sortObj = Sort.by(sortDirection, sortField);
        Pageable pageable = PageRequest.of(page, size, sortObj);

        SearchResponse response = searchService.searchProperties(request, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search/text")
    public ResponseEntity<?> searchByText(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        if (q == null || q.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Query parameter 'q' is required");
        }

        Pageable pageable = PageRequest.of(page, size);
        var results = searchService.searchProperties(
                SearchRequest.builder().location(q).build(), // Simplifié
                pageable
        );

        return ResponseEntity.ok(results);
    }

    /**
     * Endpoint dédié pour Booking-Service et Front-end React
     * Retourne toutes les infos nécessaires pour le paiement Web3
     * 
     * @param id ID de la propriété
     * @param startDate Date de début du séjour
     * @param endDate Date de fin du séjour
     * @return Informations complètes pour effectuer le paiement MetaMask
     */
    @GetMapping("/{id}/booking-info")
    public ResponseEntity<?> getPropertyBookingInfo(
            @RequestHeader(value = "X-Auth-User-Id", required = false) Long userId,
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        // Récupérer la propriété
        PropertyResponse property = propertyService.getPropertyById(id, userId);

        // Vérifier que la propriété est active
        if (property.getStatus() != ListingStatus.ACTIVE) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Property is not available for booking"));
        }

        // Calculer le prix via AvailabilityService
        long numberOfNights = ChronoUnit.DAYS.between(startDate, endDate);
        BigDecimal totalPrice = property.getPricePerNight()
                .multiply(BigDecimal.valueOf(numberOfNights));

        // AI Integration: Suggest price for the start date
        BigDecimal suggestedPrice = aiService.getSuggestedPrice(id, startDate);

        // Construire la réponse
        Map<String, Object> response = new HashMap<>();
        response.put("propertyId", property.getId());
        response.put("propertyTitle", property.getTitle());
        response.put("ownerId", property.getOwnerId());
        response.put("ownerWalletAddress", property.getOwnerWalletAddress());
        response.put("pricePerNight", property.getPricePerNight());
        response.put("suggestedPricePerNight", suggestedPrice); // AI ADDITION
        response.put("startDate", startDate);
        response.put("endDate", endDate);
        response.put("numberOfNights", numberOfNights);
        response.put("totalPrice", totalPrice);
        response.put("currency", "ETH");
        response.put("minStayNights", property.getMinStayNights());
        response.put("cancellationPolicyDays", property.getCancellationPolicyDays());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/ownership-document")
    public ResponseEntity<Map<String, String>> uploadOwnershipDocument(
            @RequestHeader("X-Auth-User-Id") Long userId,
            @PathVariable Long id,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        
        // 1. Stocker le fichier
        String fileUrl = fileStorageService.storeFile(file, "documents");
        
        // 2. Mettre à jour la base de données + Reset statut
        propertyService.updateOwnershipDocument(id, userId, fileUrl);
        
        return ResponseEntity.ok(Map.of(
                "url", fileUrl,
                "propertyId", id.toString(),
                "status", "saved_and_pending_admin"
        ));
    }
    @GetMapping("/recommendations")
    public ResponseEntity<List<PropertyResponse>> getRecommendations(
            @RequestParam BigDecimal budget) {
        return ResponseEntity.ok(propertyService.getPersonalizedRecommendations(budget));
    }
}
