package com.propertyservice.propertyservice.service;

import com.propertyservice.propertyservice.config.RabbitConfig;
import com.propertyservice.propertyservice.dto.AdminStatsResponse;
import com.propertyservice.propertyservice.dto.PropertyApprovalEvent;
import com.propertyservice.propertyservice.dto.PropertyResponse;
import com.propertyservice.propertyservice.entity.Property;
import com.propertyservice.propertyservice.enu.ListingStatus;
import com.propertyservice.propertyservice.enu.PropertyType;
import com.propertyservice.propertyservice.exception.PropertyNotFoundException;
import com.propertyservice.propertyservice.repository.PropertyRepository;
import com.propertyservice.propertyservice.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminPropertyService {

    private final PropertyRepository propertyRepository;
    private final PropertyService propertyService;
    private final AvailabilityService availabilityService;
    private final ReviewRepository reviewRepository;
    private final RabbitTemplate rabbitTemplate;

    @Transactional(readOnly = true)
    public AdminStatsResponse getStats() {
        Map<String, Long> byType = new HashMap<>();
        for (PropertyType type : PropertyType.values()) {
            byType.put(type.name(), propertyRepository.countByTypeAndStatus(type, ListingStatus.ACTIVE));
        }

        return AdminStatsResponse.builder()
                .totalProperties(propertyRepository.count())
                .activeProperties(propertyRepository.countByStatus(ListingStatus.ACTIVE))
                .pendingProperties(propertyRepository.countByStatus(ListingStatus.PENDING_ADMIN))
                .rejectedProperties(propertyRepository.countByStatus(ListingStatus.REJECTED))
                .totalReviews(reviewRepository.count())
                .propertiesByType(byType)
                .build();
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<PropertyResponse> getAllProperties(ListingStatus status, org.springframework.data.domain.Pageable pageable) {
        org.springframework.data.domain.Page<Property> properties;
        if (status != null) {
            properties = propertyRepository.findByStatus(status, pageable);
        } else {
            properties = propertyRepository.findAll(pageable);
        }
        return properties.map(propertyService::mapToPropertyResponse);
    }

    @Transactional
    public void deleteProperty(Long id) {
        if (!propertyRepository.existsById(id)) {
            throw new PropertyNotFoundException("Property not found");
        }
        propertyRepository.deleteById(id);
        log.info("Admin deleted property {}", id);
    }

    @Transactional
    public PropertyResponse approveProperty(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new PropertyNotFoundException("Property not found"));

        // Validation critique : une propriété DOIT avoir un document pour être approuvée
        if (property.getOwnershipDocumentUrl() == null || property.getOwnershipDocumentUrl().trim().isEmpty()) {
            throw new IllegalStateException("Cannot approve property without ownership document. Property ID: " + id);
        }

        property.setStatus(ListingStatus.ACTIVE);
        Property savedProperty = propertyRepository.save(property);
        
        // Trigger availability generation
        availabilityService.generateAvailabilityForYear(id);
        
        log.info("Property {} approved and availability generated.", id);

        // Notify via RabbitMQ (Safe)
        try {
            PropertyApprovalEvent event = new PropertyApprovalEvent(id, "ACTIVE", null);
            rabbitTemplate.convertAndSend(RabbitConfig.BOOKING_EXCHANGE, "PROPERTY_APPROVED", event);
            log.info("Notification sent for property approval: {}", id);
        } catch (Exception e) {
            log.error("Failed to send notification for property approval {}: {}", id, e.getMessage());
        }

        return propertyService.mapToPropertyResponse(savedProperty);
    }

    @Transactional
    public PropertyResponse rejectProperty(Long id, String reason) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new PropertyNotFoundException("Property not found"));

        property.setStatus(ListingStatus.REJECTED);
        // Could save the reason if there was a field for it, logging it for now
        log.info("Property {} rejected. Reason: {}", id, reason);
        
        Property savedProperty = propertyRepository.save(property);

        // Notify via RabbitMQ (Safe)
        try {
            PropertyApprovalEvent event = new PropertyApprovalEvent(id, "REJECTED", reason);
            rabbitTemplate.convertAndSend(RabbitConfig.BOOKING_EXCHANGE, "PROPERTY_REJECTED", event);
            log.info("Notification sent for property rejection: {}", id);
        } catch (Exception e) {
            log.error("Failed to send notification for property rejection {}: {}", id, e.getMessage());
        }

        return propertyService.mapToPropertyResponse(savedProperty);
    }
}
