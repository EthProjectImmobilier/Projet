package com.example.bookingservice.repository;

import com.example.bookingservice.entity.Booking;
import com.example.bookingservice.enu.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByPropertyId(Long propertyId);

    List<Booking> findByTenantId(Long tenantId);

    List<Booking> findByOwnerId(Long ownerId);

    Optional<Booking> findFirstByPropertyIdAndTenantWalletAddressIgnoreCaseAndStatusOrderByCreatedAtDesc(
            Long propertyId, String tenantWalletAddress, BookingStatus status);

    Optional<Booking> findByLockToken(String lockToken);

    Optional<Booking> findByPaymentTxHash(String paymentTxHash);

    Optional<Booking> findByBlockchainRentalId(Long blockchainRentalId);

    List<Booking> findByStatus(BookingStatus status);

    // Trouver les bookings actifs pour une propriété à une date
    @Query("SELECT b FROM Booking b WHERE b.propertyId = :propertyId " +
            "AND b.status IN (com.example.bookingservice.enu.BookingStatus.CONFIRMED, " +
            "com.example.bookingservice.enu.BookingStatus.ACTIVE) " +
            "AND (b.checkIn <= :checkOut AND b.checkOut >= :checkIn)")
    List<Booking> findConflictingBookings(@Param("propertyId") Long propertyId,
                                          @Param("checkIn") LocalDate checkIn,
                                          @Param("checkOut") LocalDate checkOut);

    // Trouver les bookings expirés (PENDING_PAYMENT pendant plus de 15 min)
    @Query("SELECT b FROM Booking b WHERE b.status = 'PENDING_PAYMENT' " +
            "AND b.createdAt < :expiryTime")
    List<Booking> findExpiredPendingBookings(@Param("expiryTime") LocalDateTime expiryTime);

    // Statistiques
    long countByStatus(BookingStatus status);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.ownerId = :ownerId")
    long countByOwnerId(@Param("ownerId") Long ownerId);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.tenantId = :tenantId")
    long countByTenantId(@Param("tenantId") Long tenantId);

    @Query("SELECT SUM(b.totalPrice) FROM Booking b WHERE b.ownerId = :ownerId AND b.status = 'CONFIRMED'")
    BigDecimal sumRevenueByOwnerId(@Param("ownerId") Long ownerId);

    long countByOwnerIdAndStatus(Long ownerId, BookingStatus status);

    long countByTenantIdAndStatus(Long tenantId, BookingStatus status);
}
