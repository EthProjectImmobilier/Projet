package com.propertyservice.propertyservice.dto;

import com.propertyservice.propertyservice.enu.PropertyType;
import com.propertyservice.propertyservice.entity.Address;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CreatePropertyRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title must not exceed 100 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @NotNull(message = "Property type is required")
    private PropertyType type;

    @Valid
    @NotNull(message = "Address is required")
    private Address address;

    @NotNull(message = "Price per night is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @Digits(integer = 30, fraction = 18, message = "Price format invalid")
    private BigDecimal pricePerNight;

    @Min(value = 0, message = "Security deposit cannot be negative")
    @Digits(integer = 30, fraction = 18, message = "Security deposit format invalid")
    private BigDecimal securityDeposit;

    @NotNull(message = "Max guests is required")
    @Min(value = 1, message = "Max guests must be at least 1")
    private Integer maxGuests;

    @NotNull(message = "Bedrooms count is required")
    @Min(value = 0, message = "Bedrooms count cannot be negative")
    private Integer bedrooms;

    @NotNull(message = "Bathrooms count is required")
    @Min(value = 0, message = "Bathrooms count cannot be negative")
    private Integer bathrooms;

    @NotNull(message = "Minimum stay is required")
    @Min(value = 1, message = "Minimum stay must be at least 1 night")
    private Integer minStayNights;

    @NotNull(message = "Cancellation policy is required")
    @Min(value = 0, message = "Cancellation days cannot be negative")
    private Integer cancellationPolicyDays;

    @NotNull(message = "Amenities list is required")
    private List<String> amenities;

    @NotNull(message = "Instant bookable status is required")
    private Boolean instantBookable;

    // Optionnel à la création : sera ajouté via POST /properties/{id}/ownership-document
    private String ownershipDocumentUrl;
}
