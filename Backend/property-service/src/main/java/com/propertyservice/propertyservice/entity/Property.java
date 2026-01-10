package com.propertyservice.propertyservice.entity;

import com.propertyservice.propertyservice.enu.ListingStatus;
import com.propertyservice.propertyservice.enu.PropertyType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "properties")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Property {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PropertyType type;

    @Embedded
    private Address address;

    @Column(nullable = false, precision = 38, scale = 18)
    private BigDecimal pricePerNight;

    @Column(nullable = false, precision = 38, scale = 18)
    @Builder.Default
    private BigDecimal securityDeposit = BigDecimal.ZERO;

    @Column(nullable = false)
    private Integer maxGuests;

    @Column(nullable = false)
    private Integer bedrooms;

    @Column(nullable = false)
    private Integer bathrooms;

    // Référence à l'owner dans le User Service
    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    @Column(name = "owner_wallet_address", nullable = false)
    private String ownerWalletAddress;

    @Column(name = "ownership_document_url")  // Nullable : ajouté après création via route dédiée
    private String ownershipDocumentUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ListingStatus status = ListingStatus.PENDING_ADMIN;

    @Column(nullable = false)
    @Builder.Default
    private Integer minStayNights = 1;

    @Column(nullable = false)
    @Builder.Default
    private Integer cancellationPolicyDays = 7;

    @ElementCollection
    @CollectionTable(name = "property_amenities",
            joinColumns = @JoinColumn(name = "property_id"))
    @Column(name = "amenity")
    private List<String> amenities = new ArrayList<>(); //

    @Column
    @Builder.Default
    private Boolean instantBookable = false;

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PropertyImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Review> reviews = new ArrayList<>();

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AvailabilityCalendar> availabilityEntries = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
