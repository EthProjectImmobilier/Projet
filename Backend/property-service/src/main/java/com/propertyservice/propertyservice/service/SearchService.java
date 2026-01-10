package com.propertyservice.propertyservice.service;

import com.propertyservice.propertyservice.dto.*;
import com.propertyservice.propertyservice.entity.Property;
import com.propertyservice.propertyservice.enu.ListingStatus;
import com.propertyservice.propertyservice.repository.PropertyRepository;
import com.propertyservice.propertyservice.specification.PropertySpecifications;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchService {

    private final PropertyRepository propertyRepository;
    private final PropertyService propertyService;

    @Transactional(readOnly = true)
    public SearchResponse searchProperties(SearchRequest request, Pageable pageable) {
        log.info("🔍 Searching properties with filters: {}", request);

        // 1. Construire la specification avec tous les filtres
        Specification<Property> spec = buildSpecification(request);

        // 2. Exécuter la recherche
        Page<Property> propertiesPage = propertyRepository.findAll(spec, pageable);

        // 3. Convertir en PropertyResponse
        Page<PropertyResponse> propertyResponses = propertiesPage
                .map(propertyService::mapToPropertyResponse);

        return SearchResponse.builder()
                .properties(propertyResponses)
                .totalProperties(propertiesPage.getTotalElements())
                .currentPage(propertiesPage.getNumber())
                .totalPages(propertiesPage.getTotalPages())
                .build();
    }

    private Specification<Property> buildSpecification(SearchRequest request) {
        Specification<Property> spec = PropertySpecifications.isAvailable();

        // 1. Recherche par localisation
        if (request.getLocation() != null && !request.getLocation().isBlank()) {
            spec = spec.and(PropertySpecifications.inLocation(request.getLocation()));
        }

        // 2. Dates disponibles
        if (request.hasDates()) {
            spec = spec.and(PropertySpecifications.availableBetween(
                    request.getCheckIn(), request.getCheckOut()));
        }

        // 3. Nombre de voyageurs
        if (request.getGuests() != null && request.getGuests() > 0) {
            spec = spec.and(PropertySpecifications.canAccommodateGuests(request.getGuests()));
        }

        // 4. Type de propriété
        if (request.getPropertyType() != null) {
            spec = spec.and(PropertySpecifications.hasPropertyType(request.getPropertyType()));
        }

        // 5. Prix
        if (request.getMinPrice() != null && request.getMinPrice().compareTo(BigDecimal.ZERO) > 0) {
            spec = spec.and(PropertySpecifications.hasMinPrice(request.getMinPrice()));
        }

        if (request.getMaxPrice() != null && request.getMaxPrice().compareTo(BigDecimal.ZERO) > 0) {
            spec = spec.and(PropertySpecifications.hasMaxPrice(request.getMaxPrice()));
        }

        // 6. Chambres
        if (request.getBedrooms() != null && request.getBedrooms() > 0) {
            spec = spec.and(PropertySpecifications.hasMinBedrooms(request.getBedrooms()));
        }

        // ✅ 7. Salles de bain (AJOUTÉ)
        if (request.getBathrooms() != null && request.getBathrooms() > 0) {
            spec = spec.and(PropertySpecifications.hasMinBathrooms(request.getBathrooms()));
        }

        // ✅ 8. Note minimum (DÉCOMMENTÉ)
        if (request.getMinRating() != null && request.getMinRating() >= 1 && request.getMinRating() <= 5) {
            spec = spec.and(PropertySpecifications.hasMinRating(request.getMinRating().doubleValue()));
        }

        // 9. Réservation instantanée
        if (request.getInstantBookable() != null) {
            spec = spec.and(PropertySpecifications.isInstantBookable(request.getInstantBookable()));
        }

        return spec;
    }
}
