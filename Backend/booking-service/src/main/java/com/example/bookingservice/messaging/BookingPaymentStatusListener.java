package com.example.bookingservice.messaging;

import com.example.bookingservice.client.PropertyServiceClient;
import com.example.bookingservice.entity.Booking;
import com.example.bookingservice.enu.BookingStatus;
import com.example.bookingservice.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Optional;

import static com.example.bookingservice.config.RabbitConfig.BOOKING_PAYMENT_STATUS_QUEUE;
import static com.example.bookingservice.config.RabbitConfig.PAYMENT_COMPLETED_ROUTING_KEY;

@Slf4j
@Component
@RequiredArgsConstructor
public class BookingPaymentStatusListener {

    private final BookingRepository bookingRepository;
    private final PropertyServiceClient propertyServiceClient;

    @RabbitListener(queues = BOOKING_PAYMENT_STATUS_QUEUE)
    public void handle(BookingPaymentVerificationEvent event,
                       @Header(AmqpHeaders.RECEIVED_ROUTING_KEY) String routingKey) {
        log.info("Received payment verification result for booking {}: success={}, reason={}",
                event.getBookingId(), event.isSuccess(), event.getReason());

        Optional<Booking> maybeBooking = bookingRepository.findById(event.getBookingId());
        if (maybeBooking.isEmpty()) {
            log.warn("Booking {} not found when processing payment status", event.getBookingId());
            return;
        }

        Booking booking = maybeBooking.get();
        
        // Sécurité : Ne pas ressusciter un booking annulé
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            log.warn("⚠️ Booking {} is already CANCELLED. Ignoring event: {}", booking.getId(), routingKey);
            return;
        }

        // Handle final completion of payment lifecycle
        if (PAYMENT_COMPLETED_ROUTING_KEY.equals(routingKey)) {
            booking.setStatus(BookingStatus.COMPLETED);
            booking.setCompletedAt(LocalDateTime.now());
            bookingRepository.save(booking);
            log.info("✅ Booking {} marked as COMPLETED (routingKey={})", booking.getId(), routingKey);
            return;
        }

        if (event.isSuccess()) {
            try {
                propertyServiceClient.confirmReservation(
                        booking.getPropertyId(),
                        booking.getCheckIn(),
                        booking.getCheckOut(),
                        booking.getLockToken(),
                        event.getTxHash()
                );
                log.info("✅ Property dates confirmed definitively in Property-Service for booking {}", booking.getId());

                booking.setStatus(BookingStatus.CONFIRMED);
                booking.setPaymentTxHash(event.getTxHash());
                booking.setConfirmedAt(LocalDateTime.now());
                booking.setPaymentConfirmedAt(LocalDateTime.now());
            } catch (Exception e) {
                log.error("❌ Failed to confirm reservation in Property-Service for booking {}", booking.getId(), e);
                booking.setStatus(BookingStatus.DISPUTED);
            }
        } else {
            if (booking.getStatus() == BookingStatus.PAYMENT_PROCESSING) {
                booking.setStatus(BookingStatus.PENDING_PAYMENT);
            }
        }

        bookingRepository.save(booking);
    }
}
