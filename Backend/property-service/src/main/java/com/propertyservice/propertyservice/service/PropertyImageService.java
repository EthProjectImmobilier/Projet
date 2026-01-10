package com.propertyservice.propertyservice.service;

import com.propertyservice.propertyservice.dto.PropertyImageResponse;
import com.propertyservice.propertyservice.entity.Property;
import com.propertyservice.propertyservice.entity.PropertyImage;
import com.propertyservice.propertyservice.exception.PropertyNotFoundException;
import com.propertyservice.propertyservice.repository.PropertyImageRepository;
import com.propertyservice.propertyservice.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PropertyImageService {

    private final PropertyImageRepository propertyImageRepository;
    private final PropertyRepository propertyRepository;

    @Transactional
    public PropertyImageResponse addImageToProperty(Long propertyId, String imageUrl, String caption, Long ownerId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new PropertyNotFoundException("Property not found"));

        // Vérifier que l'owner peut modifier cette propriété
        if (!property.getOwnerId().equals(ownerId)) {
            throw new RuntimeException("Unauthorized to add image to this property");
        }

        // Déterminer l'ordre d'affichage
        long imageCount = propertyImageRepository.countByPropertyId(propertyId);

        PropertyImage image = PropertyImage.builder()
                .imageUrl(imageUrl)
                .caption(caption)
                .displayOrder((int) imageCount)
                .property(property)
                .build();

        PropertyImage savedImage = propertyImageRepository.save(image);
        log.info("Image added to property {} with ID: {}", propertyId, savedImage.getId());

        return mapToPropertyImageResponse(savedImage);
    }

    public List<PropertyImageResponse> getPropertyImages(Long propertyId) {
        return propertyImageRepository.findByPropertyIdOrderByDisplayOrderAsc(propertyId)
                .stream()
                .map(this::mapToPropertyImageResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deletePropertyImage(Long imageId, Long propertyId, Long ownerId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new PropertyNotFoundException("Property not found"));

        if (!property.getOwnerId().equals(ownerId)) {
            throw new RuntimeException("Unauthorized to delete image from this property");
        }

        PropertyImage image = propertyImageRepository.findByIdAndPropertyId(imageId, propertyId)
                .orElseThrow(() -> new RuntimeException("Image not found"));

        propertyImageRepository.delete(image);
        log.info("Image deleted with ID: {} from property: {}", imageId, propertyId);
    }

    @Transactional
    public void reorderImages(Long propertyId, List<Long> imageIdsInOrder, Long ownerId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new PropertyNotFoundException("Property not found"));

        if (!property.getOwnerId().equals(ownerId)) {
            throw new RuntimeException("Unauthorized to reorder images");
        }

        for (int i = 0; i < imageIdsInOrder.size(); i++) {
            Long imageId = imageIdsInOrder.get(i);
            PropertyImage image = propertyImageRepository.findById(imageId)
                    .orElseThrow(() -> new RuntimeException("Image not found: " + imageId));

            image.setDisplayOrder(i);
            propertyImageRepository.save(image);
        }
    }

    private PropertyImageResponse mapToPropertyImageResponse(PropertyImage image) {
        return PropertyImageResponse.builder()
                .id(image.getId())
                .imageUrl(image.getImageUrl())
                .caption(image.getCaption())
                .displayOrder(image.getDisplayOrder())
                .createdAt(image.getCreatedAt())
                .build();
    }
}
