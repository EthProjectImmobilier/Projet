package com.propertyservice.propertyservice.service;

import com.propertyservice.propertyservice.dto.CreatePropertyRequest;
import com.propertyservice.propertyservice.dto.PropertyImageResponse;
import com.propertyservice.propertyservice.dto.PropertyResponse;
import com.propertyservice.propertyservice.dto.UserProfileDTO;
import com.propertyservice.propertyservice.client.UserProfileClient;
import com.propertyservice.propertyservice.entity.Property;
import com.propertyservice.propertyservice.enu.ListingStatus;
import com.propertyservice.propertyservice.exception.PropertyNotFoundException;
import com.propertyservice.propertyservice.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PropertyService {
    private final PropertyRepository propertyRepository;
    private final PropertyImageService propertyImageService;
    private final ReviewService reviewService;
    private final UserProfileClient userProfileClient;

    @Transactional
    public PropertyResponse createProperty(CreatePropertyRequest request, Long ownerId, String ownerWalletAddress, List<String> roles) {
        log.info("Creating property for owner: {}", ownerId);

        // 1. Strict Profile Validation
        if (ownerWalletAddress == null || ownerWalletAddress.trim().isEmpty()) {
            throw new com.propertyservice.propertyservice.exception.IncompleteProfileException(
                    "Veuillez compléter votre profil et valider votre KYC avant de publier (Wallet Address manquante)");
        }

        if (roles == null || !roles.contains("ROLE_OWNER")) {
            throw new com.propertyservice.propertyservice.exception.IncompleteProfileException(
                    "Veuillez compléter votre profil et valider votre KYC avant de publier (Rôle OWNER requis)");
        }

        // 2. KYC Profile Validation
        UserProfileDTO userProfile = userProfileClient.getUserProfile(ownerId);
        if (!userProfile.isKycComplete()) {
            throw new com.propertyservice.propertyservice.exception.IncompleteProfileException(
                    "Veuillez compléter votre profil KYC (photo, recto et verso de la pièce d'identité) avant de publier une propriété");
        }

        Property property = Property.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .type(request.getType())
                .address(request.getAddress())
                .pricePerNight(request.getPricePerNight())
                .maxGuests(request.getMaxGuests())
                .bedrooms(request.getBedrooms())
                .bathrooms(request.getBathrooms())
                .ownerId(ownerId)
                .ownerWalletAddress(ownerWalletAddress)
                .ownershipDocumentUrl(request.getOwnershipDocumentUrl())
                .status(ListingStatus.PENDING_ADMIN) // Force status
                .minStayNights(request.getMinStayNights())
                .cancellationPolicyDays(request.getCancellationPolicyDays())
                .amenities(request.getAmenities() != null ? request.getAmenities() : new ArrayList<>())
                .instantBookable(request.getInstantBookable())
                .securityDeposit(request.getSecurityDeposit() != null ? request.getSecurityDeposit() : BigDecimal.ZERO)
                .build();

        Property savedProperty = propertyRepository.save(property);
        log.info("Property created with ID: {}", savedProperty.getId());

        return mapToPropertyResponse(savedProperty);
    }

    public PropertyResponse getPropertyById(Long id, Long requesterId) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new PropertyNotFoundException("Property not found with id: " + id));

        // Visibility Check: Only ACTIVE properties are visible to everyone.
        // PENDING_ADMIN or REJECTED properties are only visible to the owner.
        if (property.getStatus() != ListingStatus.ACTIVE) {
            if (requesterId == null || !property.getOwnerId().equals(requesterId)) {
                log.warn("Unauthorized access attempt to non-active property {} by user {}", id, requesterId);
                throw new PropertyNotFoundException("Property is not available");
            }
        }

        return mapToPropertyResponse(property);
    }

    public Page<PropertyResponse> getPropertiesByOwner(Long ownerId, Pageable pageable) {
        return propertyRepository.findByOwnerId(ownerId, pageable)
                .map(this::mapToPropertyResponse);
    }

    public Page<PropertyResponse> getAvailableProperties(Pageable pageable) {
        // Implémentation temporaire - à compléter avec les filtres
        return propertyRepository.findByStatus(ListingStatus.ACTIVE, pageable)
                .map(this::mapToPropertyResponse);
    }

    @Transactional
    public PropertyResponse updateProperty(Long id, CreatePropertyRequest request, Long ownerId) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new PropertyNotFoundException("Property not found"));

        // Vérifier que l'owner peut modifier cette propriété
        if (!property.getOwnerId().equals(ownerId)) {
            throw new RuntimeException("Unauthorized to update this property");
        }

        property.setTitle(request.getTitle());
        property.setDescription(request.getDescription());
        property.setType(request.getType());
        property.setAddress(request.getAddress());
        property.setPricePerNight(request.getPricePerNight());
        property.setMaxGuests(request.getMaxGuests());
        property.setBedrooms(request.getBedrooms());
        property.setBathrooms(request.getBathrooms());
        property.setMinStayNights(request.getMinStayNights());
        property.setCancellationPolicyDays(request.getCancellationPolicyDays());
        property.setAmenities(request.getAmenities() != null ? request.getAmenities() : new java.util.ArrayList<>());
        property.setInstantBookable(request.getInstantBookable());
        property.setSecurityDeposit(request.getSecurityDeposit() != null ? request.getSecurityDeposit() : property.getSecurityDeposit());
        // ⚠️ ownershipDocumentUrl N'EST PAS modifiable via PUT
        // Utiliser POST /properties/{id}/ownership-document pour changer le document

        // Reset status pour validation admin obligatoire après modif
        property.setStatus(ListingStatus.PENDING_ADMIN);

        Property updatedProperty = propertyRepository.save(property);
        log.info("Property {} updated and status reset to PENDING_ADMIN", id);
        return mapToPropertyResponse(updatedProperty);
    }

    @Transactional
    public void deleteProperty(Long id, Long ownerId) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new PropertyNotFoundException("Property not found"));

        if (!property.getOwnerId().equals(ownerId)) {
            throw new RuntimeException("Unauthorized to delete this property");
        }

        propertyRepository.delete(property);
        log.info("Property deleted with ID: {}", id);
    }

    @Transactional
    public String updateOwnershipDocument(Long id, Long ownerId, String documentUrl) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new PropertyNotFoundException("Property not found"));

        if (!property.getOwnerId().equals(ownerId)) {
            throw new RuntimeException("Unauthorized to update this property");
        }

        property.setOwnershipDocumentUrl(documentUrl);
        // Reset status criteria: any update to critical documents requires re-validation
        property.setStatus(ListingStatus.PENDING_ADMIN);
        
        propertyRepository.save(property);
        log.info("Ownership document updated for property {} and status reset to PENDING_ADMIN", id);
        return documentUrl;
    }

    public PropertyResponse mapToPropertyResponse(Property property) {
        List<PropertyImageResponse> imageResponses = propertyImageService.getPropertyImages(property.getId());

        // Récupérer les stats des reviews
        Double averageRating = reviewService.getPropertyAverageRating(property.getId());
        Integer totalReviews = reviewService.getPropertyReviewCount(property.getId());
        return PropertyResponse.builder()
                .id(property.getId())
                .title(property.getTitle())
                .description(property.getDescription())
                .type(property.getType())
                .address(property.getAddress())
                .pricePerNight(property.getPricePerNight())
                .maxGuests(property.getMaxGuests())
                .bedrooms(property.getBedrooms())
                .bathrooms(property.getBathrooms())
                .ownerId(property.getOwnerId())
                .ownerWalletAddress(property.getOwnerWalletAddress())
                .ownershipDocumentUrl(property.getOwnershipDocumentUrl()) // ← AJOUTÉ ICI
                .status(property.getStatus())
                .createdAt(property.getCreatedAt())
                .updatedAt(property.getUpdatedAt())
                .images(imageResponses)
                .averageRating(averageRating)
                .totalReviews(totalReviews)
                .minStayNights(property.getMinStayNights())
                .cancellationPolicyDays(property.getCancellationPolicyDays())
                .amenities(property.getAmenities())
                .instantBookable(property.getInstantBookable())
                .securityDeposit(property.getSecurityDeposit())
                .build();
    }
}
