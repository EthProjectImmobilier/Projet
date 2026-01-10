package com.example.bookingservice.service;

import com.example.bookingservice.client.PropertyServiceClient;
import com.example.bookingservice.entity.Booking;
import com.example.bookingservice.enu.BookingStatus;
import com.example.bookingservice.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScheduledTasks {

    private final BookingRepository bookingRepository;
    private final PropertyServiceClient propertyServiceClient;

    /**
     * Nettoie les bookings en PENDING_PAYMENT qui ont expiré (15 minutes)
     * Exécuté toutes les 5 minutes
     */
    @Scheduled(fixedRate = 300000) // 5 minutes
    @Transactional
    public void cleanupExpiredBookings() {
        LocalDateTime expiryTime = LocalDateTime.now().minusMinutes(15);
        List<Booking> expiredBookings = bookingRepository.findExpiredPendingBookings(expiryTime);

        if (!expiredBookings.isEmpty()) {
            log.info("Cleaning up {} expired pending bookings", expiredBookings.size());

            for (Booking booking : expiredBookings) {
                try {
                    // Libérer les dates dans Property-Service
                    propertyServiceClient.releaseDates(booking.getPropertyId(), booking.getLockToken());

                    // Marquer comme annulé
                    booking.setStatus(BookingStatus.CANCELLED);
                    booking.setCancellationReason("Payment timeout - automatic cancellation");
                    booking.setCancelledAt(LocalDateTime.now());
                    bookingRepository.save(booking);

                    log.info("Auto-cancelled expired booking: {}", booking.getId());

                } catch (Exception e) {
                    log.error("❌ Failed to cleanup expired Web3 booking {}: {}", booking.getId(), e.getMessage());
                }
            }
        }
    }

    /**
     * Met à jour les bookings CONFIRMED → ACTIVE le jour du check-in
     * Exécuté toutes les heures
     */
    @Scheduled(cron = "0 0 * * * *") // Toutes les heures
    @Transactional
    public void activateBookings() {
        LocalDate today = LocalDate.now();
        List<Booking> confirmedBookings = bookingRepository.findByStatus(BookingStatus.CONFIRMED);

        for (Booking booking : confirmedBookings) {
            if (!booking.getCheckIn().isAfter(today)) { // checkIn <= today
                booking.setStatus(BookingStatus.ACTIVE);
                bookingRepository.save(booking);
                log.info("🏠 Marked booking {} as ACTIVE. Stay starts today ({}).", booking.getId(), booking.getCheckIn());
            }
        }
    }

    /**
     * Met à jour les bookings ACTIVE → COMPLETED après la date de check-out
     * Exécuté toutes les heures
     */
    @Scheduled(cron = "0 30 * * * *") // Toutes les heures à :30
    @Transactional
    public void markCompletedBookings() {
        LocalDate today = LocalDate.now();
        List<Booking> activeBookings = bookingRepository.findByStatus(BookingStatus.ACTIVE);

        for (Booking booking : activeBookings) {
            if (booking.getCheckOut().isBefore(today)) { // checkOut < today
                booking.setStatus(BookingStatus.COMPLETED);
                booking.setCompletedAt(LocalDateTime.now());
                bookingRepository.save(booking);
                log.info("🏠 Marked booking {} as COMPLETED. Stay is over ({}).", booking.getId(), booking.getCheckOut());
            }
        }
    }
}
