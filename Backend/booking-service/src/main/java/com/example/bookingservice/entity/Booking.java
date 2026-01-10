// Booking.java
package com.example.bookingservice.entity;

import com.example.bookingservice.enu.BookingStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long propertyId;

    @Column(nullable = false)
    private Long tenantId;           // ID du locataire (from user-service)

    @Column(nullable = false)
    private String tenantWalletAddress; // Adresse Ethereum du locataire

    @Column(nullable = false)
    private Long ownerId;            // ID du propriétaire

    @Column(nullable = false)
    private String ownerWalletAddress; // Adresse Ethereum du propriétaire

    @Column(nullable = false)
    private LocalDate checkIn;

    @Column(nullable = false)
    private LocalDate checkOut;

    @Column(nullable = false)
    private Integer numberOfGuests;

    @Column(nullable = false, precision = 38, scale = 18)
    private BigDecimal totalPrice;

    @Column(nullable = false, precision = 38, scale = 18)
    private BigDecimal securityDeposit; // Caution

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    @Column(nullable = false)
    private String lockToken;        // Token de verrouillage (from property-service)

    @Column(unique = true)
    private String paymentTxHash;    // Hash de transaction Ethereum

    @Column
    private Long blockchainRentalId; // ID unique du contrat de location sur la blockchain

    @Column
    private String escrowContractAddress; // Adresse du contrat d'escrow

    @Column
    private String cancellationReason;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime confirmedAt;

    @Column
    private LocalDateTime cancelledAt;

    @Column
    private LocalDateTime completedAt;

    @Column
    private LocalDateTime paymentConfirmedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = BookingStatus.PENDING_PAYMENT;
        }
    }
}