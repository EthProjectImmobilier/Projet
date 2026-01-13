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
    private final AIService aiService;

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
        UserProfileDTO ownerProfile = null;
        try {
            ownerProfile = userProfileClient.getUserProfile(ownerId);
        } catch (Exception e) {
            log.warn("Could not fetch owner profile for owner {}: {}", ownerId, e.getMessage());
        }
        
        final UserProfileDTO profile = ownerProfile;
        return propertyRepository.findByOwnerId(ownerId, pageable)
                .map(p -> this.mapToPropertyResponse(p, profile));
    }

    public List<PropertyResponse> getPropertiesByOwnerList(Long ownerId) {
        UserProfileDTO ownerProfile = null;
        try {
            ownerProfile = userProfileClient.getUserProfile(ownerId);
        } catch (Exception e) {
            log.warn("Could not fetch owner profile for owner {}: {}", ownerId, e.getMessage());
        }

        final UserProfileDTO profile = ownerProfile;
        return propertyRepository.findByOwnerId(ownerId).stream()
                .map(p -> this.mapToPropertyResponse(p, profile))
                .toList();
    }

    public Page<PropertyResponse> getAvailableProperties(Pageable pageable) {
        Page<Property> properties = propertyRepository.findByStatus(ListingStatus.ACTIVE, pageable);
        
        // Batch fetch unique owner profiles
        List<Long> ownerIds = properties.getContent().stream()
                .map(Property::getOwnerId)
                .distinct()
                .toList();
        
        java.util.Map<Long, UserProfileDTO> ownerProfiles = new java.util.HashMap<>();
        if (!ownerIds.isEmpty()) {
            try {
                List<UserProfileDTO> profiles = userProfileClient.getUsersByIds(ownerIds);
                profiles.forEach(p -> ownerProfiles.put(p.getId(), p));
            } catch (Exception e) {
                log.warn("Could not batch fetch owner profiles: {}", e.getMessage());
            }
        }

        return properties.map(p -> this.mapToPropertyResponse(p, ownerProfiles.get(p.getOwnerId())));
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
        return mapToPropertyResponse(property, null);
    }

    public PropertyResponse mapToPropertyResponse(Property property, UserProfileDTO ownerProfile) {
        List<PropertyImageResponse> imageResponses = propertyImageService.getPropertyImages(property.getId());

        // Récupérer les stats des reviews
        Double averageRating = reviewService.getPropertyAverageRating(property.getId());
        Integer totalReviews = reviewService.getPropertyReviewCount(property.getId());

        // Si le profil n'est pas fourni, on essaie de le récupérer (fallback)
        if (ownerProfile == null && property.getOwnerId() != null) {
            try {
                ownerProfile = userProfileClient.getUserProfile(property.getOwnerId());
            } catch (Exception e) {
                log.warn("Could not fetch owner profile for property {}: {}", property.getId(), e.getMessage());
            }
        }

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
                .ownerFirstName(ownerProfile != null ? ownerProfile.getFirstName() : null)
                .ownerLastName(ownerProfile != null ? ownerProfile.getLastName() : null)
                .ownerProfilePicture(ownerProfile != null ? ownerProfile.getPhotoUrl() : null)
                .ownerWalletAddress(property.getOwnerWalletAddress())
                .ownershipDocumentUrl(property.getOwnershipDocumentUrl())
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
    public List<PropertyResponse> getPersonalizedRecommendations(BigDecimal budget) {
        // 1. Appeler l'IA pour avoir les IDs recommandés
        List<Long> recommendedIds = aiService.getRecommendedPropertyIds(budget);
        
        if (recommendedIds.isEmpty()) {
            return new ArrayList<>();
        }

        // 2. Récupérer les propriétés depuis la DB
        List<Property> properties = propertyRepository.findAllById(recommendedIds);

        // 3. Batch fetch unique owner profiles
        List<Long> ownerIds = properties.stream()
                .map(Property::getOwnerId)
                .distinct()
                .toList();

        java.util.Map<Long, UserProfileDTO> ownerProfiles = new java.util.HashMap<>();
        if (!ownerIds.isEmpty()) {
            try {
                List<UserProfileDTO> profiles = userProfileClient.getUsersByIds(ownerIds);
                profiles.forEach(p -> ownerProfiles.put(p.getId(), p));
            } catch (Exception e) {
                log.warn("Could not batch fetch owner profiles for recommendations: {}", e.getMessage());
            }
        }

        // 4. Trier les propriétés dans l'ordre donné par l'IA (meilleur match en premier)
        // Map pour un accès rapide
        java.util.Map<Long, Property> propertyMap = properties.stream()
                .collect(java.util.stream.Collectors.toMap(Property::getId, p -> p));

        List<PropertyResponse> sortedResponses = new ArrayList<>();
        for (Long id : recommendedIds) {
            if (propertyMap.containsKey(id)) {
                Property property = propertyMap.get(id);
                // Filtrer : Seules les propriétés ACTIVE sont retournées
                if (property.getStatus() == ListingStatus.ACTIVE) {
                    sortedResponses.add(mapToPropertyResponse(property, ownerProfiles.get(property.getOwnerId())));
                }
            }
        }

        return sortedResponses;
    }
}
