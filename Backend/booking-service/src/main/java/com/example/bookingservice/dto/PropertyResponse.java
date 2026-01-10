package com.example.bookingservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class PropertyResponse {
    private Long id;
    private String title;
    private String description;
    private String type;
    @JsonProperty("address")
    private Object address;
    private BigDecimal pricePerNight;
    private BigDecimal securityDeposit;
    private Integer maxGuests;
    private Integer bedrooms;
    private Integer bathrooms;
    private Long ownerId;
    private String ownerWalletAddress;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer minStayNights;
    private Integer cancellationPolicyDays;
    private List<String> amenities;
    private Boolean instantBookable;
    private List<PropertyImageResponse> images;
    private Double averageRating;
    private Integer totalReviews;

    @Data
    @Builder
    public static class PropertyImageResponse {
        private Long id;
        private String imageUrl;
        private Boolean isPrimary;
    }
}
