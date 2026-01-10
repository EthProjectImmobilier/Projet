package com.example.bookingservice.service;

import com.example.bookingservice.client.PropertyServiceClient;
import com.example.bookingservice.client.UserClient;
import com.example.bookingservice.config.RabbitConfig;
import com.example.bookingservice.dto.*;
import com.example.bookingservice.entity.Booking;
import com.example.bookingservice.enu.BookingStatus;
import com.example.bookingservice.exception.*;
import com.example.bookingservice.messaging.BookingCancellationEvent;
import com.example.bookingservice.messaging.TransactionVerificationRequest;
import com.example.bookingservice.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final PropertyServiceClient propertyServiceClient;
    private final UserClient userClient;
    private final RabbitTemplate rabbitTemplate;

    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request,
                                         Long tenantId,
                                         String tenantWalletAddress) {
        log.info("Creating booking for tenant: {}, wallet: {}, property: {}",
                tenantId, tenantWalletAddress, request.getPropertyId());

        // 1. Vérifier le profil de l'utilisateur (KYC + Wallet)
        validateUserForBooking(tenantId);

        // 2. Récupérer les infos de la propriété (Source of truth)
        PropertyResponse property = propertyServiceClient.getPropertyById(request.getPropertyId());

        if (property.getOwnerWalletAddress() == null || property.getOwnerWalletAddress().isBlank()) {
            throw new IllegalStateException("Property owner wallet address not found");
        }

        // 2. Valider la propriété (basique: capacité, dates min/max)
        validatePropertyForBooking(property, request);

        // 3. Calculer le montant total manuellement pour garantir l'intégrité (Backend-Calculated)
        long numberOfNights = ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());
        if (numberOfNights <= 0) {
            throw new IllegalArgumentException("Invalid date range: check-out must be after check-in");
        }

        BigDecimal totalPrice = property.getPricePerNight().multiply(BigDecimal.valueOf(numberOfNights));
        BigDecimal securityDeposit = property.getSecurityDeposit();

        // 3.5 Vérifier les conflits de dates locaux avant de tenter de verrouiller
        checkForBookingConflicts(request.getPropertyId(), request.getCheckIn(), request.getCheckOut());

        // 4. Verrouiller les dates et obtenir le lockToken officiel via Property-Service
        String lockToken;
        try {
            java.util.Map<String, Object> lockResponse = propertyServiceClient.blockDates(
                    tenantId,
                    request.getPropertyId(),
                    request.getCheckIn(),
                    request.getCheckOut()
            );

            if (lockResponse == null || !lockResponse.containsKey("lockToken")) {
                throw new ServiceIntegrationException("Property-Service did not return a lockToken");
            }

            lockToken = (String) lockResponse.get("lockToken");
        } catch (Exception e) {
            log.error("❌ Failed to lock dates via Property-Service (blockDates): {}", e.getMessage());
            throw new ServiceIntegrationException("Could not secure dates for booking: " + e.getMessage());
        }

        // 5. Créer le booking avec les données garanties par le backend
        Booking booking = Booking.builder()
                .propertyId(request.getPropertyId())
                .tenantId(tenantId)
                .tenantWalletAddress(tenantWalletAddress)
                .ownerId(property.getOwnerId())
                .ownerWalletAddress(property.getOwnerWalletAddress())
                .checkIn(request.getCheckIn())
                .checkOut(request.getCheckOut())
                .numberOfGuests(request.getNumberOfGuests())
                .totalPrice(totalPrice)
                .securityDeposit(securityDeposit)
                .status(BookingStatus.PENDING_PAYMENT)
                .lockToken(lockToken)
                .build();

        Booking savedBooking = bookingRepository.save(booking);
        log.info("🔐 Web3 Booking initiated (Backend Verified): ID={}, property={}, lockToken={}, price={} ETH",
                savedBooking.getId(), savedBooking.getPropertyId(), savedBooking.getLockToken(), savedBooking.getTotalPrice());

        // 6. Retourner la réponse avec infos hydratées
        return buildBookingResponse(savedBooking, property);
    }

    public OwnerStatsResponse getOwnerStats(Long ownerId) {
        long total = bookingRepository.countByOwnerId(ownerId);
        long confirmed = bookingRepository.countByOwnerIdAndStatus(ownerId, BookingStatus.CONFIRMED);
        long pending = bookingRepository.countByOwnerIdAndStatus(ownerId, BookingStatus.PENDING_PAYMENT);
        long cancelled = bookingRepository.countByOwnerIdAndStatus(ownerId, BookingStatus.CANCELLED);
        long active = bookingRepository.countByOwnerIdAndStatus(ownerId, BookingStatus.ACTIVE);

        BigDecimal revenue = bookingRepository.sumRevenueByOwnerId(ownerId);
        if (revenue == null) revenue = BigDecimal.ZERO;

        java.util.Map<String, Long> byStatus = new java.util.HashMap<>();
        for (BookingStatus status : BookingStatus.values()) {
            byStatus.put(status.name(), bookingRepository.countByOwnerIdAndStatus(ownerId, status));
        }

        return OwnerStatsResponse.builder()
                .totalBookings(total)
                .confirmedBookings(confirmed)
                .pendingBookings(pending)
                .cancelledBookings(cancelled)
                .activeBookings(active)
                .totalRevenue(revenue)
                .bookingsByStatus(byStatus)
                .build();
    }


    @Transactional
    public void linkBlockchainRentalId(Long propertyId, String tenantAddress, Long blockchainRentalId, String txHash) {
        log.info("Linking blockchain rental ID {} and txHash {} for property {} and tenant {}",
                blockchainRentalId, txHash, propertyId, tenantAddress);

        Booking booking = bookingRepository.findFirstByPropertyIdAndTenantWalletAddressIgnoreCaseAndStatusOrderByCreatedAtDesc(
                        propertyId, tenantAddress, BookingStatus.PENDING_PAYMENT)
                .orElseThrow(() -> new BookingNotFoundException("No pending booking found for property " + propertyId + " and tenant " + tenantAddress));

        booking.setBlockchainRentalId(blockchainRentalId);
        if (txHash != null && !txHash.isBlank()) {
            booking.setPaymentTxHash(txHash);
            booking.setStatus(BookingStatus.PAYMENT_PROCESSING);
        }
        bookingRepository.save(booking);
        log.info("✅ Linked booking {} to blockchain ID {} and txHash {}", booking.getId(), blockchainRentalId, txHash);
    }

    @Transactional
    public BookingResponse confirmBooking(Long bookingId, String transactionHash, Long userId) {
        log.info("🔗 Confirming Web3 booking ID: {} with ETH transaction: {} by user: {}",
                bookingId, transactionHash, userId);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with id: " + bookingId));

        if (!booking.getTenantId().equals(userId)) {
            throw new UnauthorizedActionException("Only the tenant who initiated the booking can confirm it");
        }

        if (booking.getStatus() != BookingStatus.PENDING_PAYMENT) {
            throw new InvalidBookingStateException("Cannot confirm booking in status: " + booking.getStatus());
        }
        // Marquer le booking comme en cours de traitement de paiement
        booking.setStatus(BookingStatus.PAYMENT_PROCESSING);
        booking.setPaymentTxHash(transactionHash);
        Booking updatedBooking = bookingRepository.save(booking);

        // Calculer le montant attendu en Wei (1 ETH = 10^18 Wei)
        java.math.BigDecimal totalEth = booking.getTotalPrice().add(booking.getSecurityDeposit() != null ? booking.getSecurityDeposit() : java.math.BigDecimal.ZERO);
        java.math.BigInteger expectedAmountInWei = totalEth.multiply(new java.math.BigDecimal("1000000000000000000")).toBigInteger();

        // Publier la requête de vérification de transaction vers blockchain-service
        TransactionVerificationRequest request = new TransactionVerificationRequest(bookingId, transactionHash, expectedAmountInWei);
        rabbitTemplate.convertAndSend(
                RabbitConfig.BOOKING_EXCHANGE,
                RabbitConfig.TRANSACTION_VERIFICATION_ROUTING_KEY,
                request
        );

        log.info("📤 Enqueued blockchain transaction verification for booking {} with tx {}", bookingId, transactionHash);

        PropertyResponse property = propertyServiceClient.getPropertyById(booking.getPropertyId());

        // La confirmation finale sera effectuée de manière asynchrone par le listener de statut de paiement
        return buildBookingResponse(updatedBooking, property);
    }

    @Transactional
    public BookingResponse cancelBooking(Long bookingId, Long userId, String reason) {
        log.info("Cancelling booking ID: {} by user: {}", bookingId, userId);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found"));

        // Vérifier les permissions
        if (!booking.getTenantId().equals(userId) && !booking.getOwnerId().equals(userId)) {
            throw new UnauthorizedActionException("You are not authorized to cancel this booking");
        }

        // Validation selon le statut
        validateCancellation(booking, userId);

        // Si le booking était confirmé, libérer les dates
        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            try {
                propertyServiceClient.releaseDates(booking.getPropertyId(), booking.getLockToken());
                log.info("Property dates released for cancelled booking: {}", bookingId);
            } catch (Exception e) {
                log.warn("Failed to release property dates for booking: {}", bookingId, e);
            }
        }

        // Mettre à jour le booking
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(reason);
        booking.setCancelledAt(LocalDateTime.now());
        Booking cancelledBooking = bookingRepository.save(booking);

        // Récupérer les infos pour la réponse
        PropertyResponse property = propertyServiceClient.getPropertyById(booking.getPropertyId());

        log.info("Booking ID: {} cancelled by user: {}", bookingId, userId);
 
        // Notify via RabbitMQ (Safe)
        try {
            BookingCancellationEvent event = new BookingCancellationEvent(bookingId, reason);
            rabbitTemplate.convertAndSend(RabbitConfig.BOOKING_EXCHANGE, RabbitConfig.BOOKING_CANCELLED_ROUTING_KEY, event);
            log.info("Notification sent for booking cancellation: {}", bookingId);
        } catch (Exception e) {
            log.error("Failed to send notification for booking cancellation {}: {}", bookingId, e.getMessage());
        }

        return buildBookingResponse(cancelledBooking, property);
    }

    public BookingResponse getBookingById(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found"));

        // Vérifier les permissions
        if (!booking.getTenantId().equals(userId) && !booking.getOwnerId().equals(userId)) {
            throw new UnauthorizedActionException("You are not authorized to view this booking");
        }

        PropertyResponse property = propertyServiceClient.getPropertyById(booking.getPropertyId());

        return buildBookingResponse(booking, property);
    }

    public List<BookingResponse> getUserBookings(Long userId, BookingStatus status) {
        List<Booking> bookings;

        if (status != null) {
            bookings = bookingRepository.findByTenantId(userId).stream()
                    .filter(b -> b.getStatus() == status)
                    .toList();
        } else {
            bookings = bookingRepository.findByTenantId(userId);
        }

        return bookings.stream()
                .map(booking -> {
                    try {
                        PropertyResponse property = propertyServiceClient.getPropertyById(booking.getPropertyId());
                        return buildBookingResponse(booking, property);
                    } catch (Exception e) {
                        log.error("Failed to fetch details for booking: {}", booking.getId(), e);
                        return buildBookingResponse(booking, null);
                    }
                })
                .toList();
    }

    public List<BookingResponse> getOwnerBookings(Long ownerId, BookingStatus status) {
        List<Booking> bookings;

        if (status != null) {
            bookings = bookingRepository.findByOwnerId(ownerId).stream()
                    .filter(b -> b.getStatus() == status)
                    .toList();
        } else {
            bookings = bookingRepository.findByOwnerId(ownerId);
        }

        return bookings.stream()
                .map(booking -> {
                    try {
                        PropertyResponse property = propertyServiceClient.getPropertyById(booking.getPropertyId());
                        return buildBookingResponse(booking, property);
                    } catch (Exception e) {
                        log.error("Failed to fetch details for booking: {}", booking.getId(), e);
                        return buildBookingResponse(booking, null);
                    }
                })
                .toList();
    }

    // Méthodes privées utilitaires
    private void validatePropertyForBooking(PropertyResponse property, CreateBookingRequest request) {
        if (property == null) {
            throw new ServiceIntegrationException("Property service returned null property");
        }

        if (request.getCheckIn() == null || request.getCheckOut() == null) {
            throw new InvalidBookingRequestException("Check-in and check-out dates are required");
        }

        if (!request.getCheckOut().isAfter(request.getCheckIn())) {
            throw new InvalidBookingRequestException("Check-out date must be after check-in date");
        }

        if (property.getStatus() != null && !property.getStatus().equalsIgnoreCase("ACTIVE")) {
            throw new InvalidBookingRequestException("Property is not available for booking (Status: " + property.getStatus() + ")");
        }

        if (property.getMaxGuests() != null && request.getNumberOfGuests() != null
                && request.getNumberOfGuests() > property.getMaxGuests()) {
            throw new InvalidBookingRequestException("Number of guests exceeds property capacity");
        }

        Integer minStay = property.getMinStayNights();
        if (minStay != null && minStay > 0) {
            long nights = ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());
            if (nights < minStay) {
                throw new InvalidBookingRequestException("Minimum stay is " + minStay + " nights");
            }
        }

        /* MVP: si la propriété n'est pas instant bookable, on refuse (pas de workflow d'approbation owner dans ce service)
        if (property.getInstantBookable() != null && !property.getInstantBookable()) {
            throw new InvalidBookingRequestException("Property requires owner approval (not supported in MVP)");
        } */
    }

    private void checkForBookingConflicts(Long propertyId, LocalDate checkIn, LocalDate checkOut) {
        if (propertyId == null || checkIn == null || checkOut == null) {
            throw new InvalidBookingRequestException("PropertyId, checkIn and checkOut are required");
        }

        List<Booking> conflicts = bookingRepository.findConflictingBookings(propertyId, checkIn, checkOut);
        if (conflicts != null && !conflicts.isEmpty()) {
            throw new BookingConflictException("Property is not available for the selected dates");
        }
    }

    private void validateCancellation(Booking booking, Long userId) {
        if (booking == null) {
            throw new BookingNotFoundException("Booking not found");
        }

        if (!booking.getTenantId().equals(userId) && !booking.getOwnerId().equals(userId)) {
            throw new UnauthorizedActionException("You are not authorized to cancel this booking");
        }

        // MVP: règles simples
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new InvalidBookingStateException("Booking is already cancelled");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new InvalidBookingStateException("Cannot cancel a completed booking");
        }

        if (booking.getStatus() == BookingStatus.ACTIVE) {
            throw new InvalidBookingStateException("Cannot cancel an active booking");
        }

        // Si le séjour a déjà commencé, refus
        if (booking.getCheckIn() != null && booking.getCheckIn().isBefore(LocalDate.now())) {
            throw new InvalidBookingStateException("Cannot cancel a booking that already started");
        }
    }

    private BookingResponse buildBookingResponse(Booking booking, PropertyResponse property) {
        String tenantName = null;
        String ownerName = null;

        try {
            UserProfileDTO tenant = userClient.getUserProfile(booking.getTenantId());
            if (tenant != null) {
                tenantName = tenant.getFirstName() + " " + tenant.getLastName();
            }
        } catch (Exception e) {
            log.warn("Could not fetch tenant name for booking {}: {}", booking.getId(), e.getMessage());
        }

        try {
            UserProfileDTO owner = userClient.getUserProfile(booking.getOwnerId());
            if (owner != null) {
                ownerName = owner.getFirstName() + " " + owner.getLastName();
            }
        } catch (Exception e) {
            log.warn("Could not fetch owner name for booking {}: {}", booking.getId(), e.getMessage());
        }

        return BookingResponse.builder()
                .id(booking.getId())
                .propertyId(booking.getPropertyId())
                .tenantId(booking.getTenantId())
                .tenantWalletAddress(booking.getTenantWalletAddress())
                .ownerId(booking.getOwnerId())
                .ownerWalletAddress(booking.getOwnerWalletAddress())
                .checkIn(booking.getCheckIn())
                .checkOut(booking.getCheckOut())
                .numberOfGuests(booking.getNumberOfGuests())
                .totalPrice(booking.getTotalPrice())
                .securityDeposit(booking.getSecurityDeposit())
                .status(booking.getStatus())
                .lockToken(booking.getLockToken())
                .paymentTxHash(booking.getPaymentTxHash())
                .blockchainRentalId(booking.getBlockchainRentalId())
                .cancellationReason(booking.getCancellationReason())
                .createdAt(booking.getCreatedAt())
                .confirmedAt(booking.getConfirmedAt())
                .cancelledAt(booking.getCancelledAt())
                .completedAt(booking.getCompletedAt())
                .paymentConfirmedAt(booking.getPaymentConfirmedAt())
                .propertyTitle(property != null ? property.getTitle() : null)
                .propertyAddress(property != null ? convertAddressToString(property.getAddress()) : null)
                .tenantName(tenantName)
                .ownerName(ownerName)
                .build();
    }
    private String convertAddressToString(Object address) {
        if (address == null) return null;

        if (address instanceof String) {
            return (String) address;
        }

        // Si c'est un objet JSON (Map), construire une string
        try {
            // Solution MVP simple
            return address.toString(); // "[street=..., city=...]"
        } catch (Exception e) {
            return "Address available";
        }
    }

    private void validateUserForBooking(Long userId) {
        try {
            UserProfileDTO user = userClient.getUserProfile(userId);

            if (user == null) {
                throw new BookingNotFoundException("User profile not found");
            }

            if (!user.isWalletVerified()) {
                throw new IncompleteProfileException("Votre wallet doit être vérifié avant de pouvoir réserver.");
            }

            if (!user.isKycComplete()) {
                throw new IncompleteProfileException("Votre profil est incomplet (photo ou documents KYC manquants). Veuillez compléter votre profil.");
            }

            log.info("✅ User {} validated for booking (KYC & Wallet OK)", userId);
        } catch (IncompleteProfileException | BookingNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Error while validating user {}: {}", userId, e.getMessage());
            // En cas d'erreur de communication, on bloque par sécurité pour le MVP
            throw new ServiceIntegrationException("Impossible de vérifier votre profil utilisateur pour le moment.");
        }
    }
}