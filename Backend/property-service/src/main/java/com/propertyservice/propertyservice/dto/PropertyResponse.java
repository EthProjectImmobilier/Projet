package com.propertyservice.propertyservice.dto;

import com.propertyservice.propertyservice.enu.ListingStatus;
import com.propertyservice.propertyservice.enu.PropertyType;
import com.propertyservice.propertyservice.entity.Address;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class PropertyResponse {
    private Long id;
    private String title;
    private String description;
    private PropertyType type;
    private Address address;
    private BigDecimal pricePerNight;
    private BigDecimal securityDeposit;
    private Integer maxGuests;
    private Integer bedrooms;
    private Integer bathrooms;
    private Long ownerId;
    private String ownerWalletAddress;
    private String ownershipDocumentUrl; // ← AJOUTÉ POUR L'ADMIN
    private ListingStatus status;
    private Integer minStayNights;
    private Integer cancellationPolicyDays;
    private List<String> amenities;
    private Boolean instantBookable;
    private BigDecimal suggestedPricePerNight; // AI ADDITION
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Images associées
    private List<PropertyImageResponse> images;

    // Stats calculées
    private Double averageRating;
    private Integer totalReviews;
}
