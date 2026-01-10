package com.propertyservice.propertyservice.repository;

import com.propertyservice.propertyservice.entity.AvailabilityCalendar;
import com.propertyservice.propertyservice.enu.AvailabilityStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AvailabilityRepository extends JpaRepository<AvailabilityCalendar, Long> {

    List<AvailabilityCalendar> findByPropertyIdAndDateBetween(Long propertyId, LocalDate startDate, LocalDate endDate);

    Optional<AvailabilityCalendar> findByPropertyIdAndDate(Long propertyId, LocalDate date);

    @Query("SELECT a FROM AvailabilityCalendar a WHERE " +
            "a.property.id = :propertyId AND " +
            "a.date BETWEEN :startDate AND :endDate AND " +
            "a.status = :status")
    List<AvailabilityCalendar> findByPropertyIdAndDateBetweenAndStatus(
            @Param("propertyId") Long propertyId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("status") AvailabilityStatus status);

    // 1. Trouver tous les verrous avec un token donné
    List<AvailabilityCalendar> findByLockToken(String lockToken);

    // 2. Trouver les verrous d'une propriété spécifique avec un token
    List<AvailabilityCalendar> findByPropertyIdAndLockToken(Long propertyId, String lockToken);

    // 3. Trouver les verrous expirés (pour nettoyage automatique)
    List<AvailabilityCalendar> findByLockExpiresAtBefore(LocalDateTime expiryTime);

    // 4. Supprimer par token (optionnel)
    @Modifying
    @Query("DELETE FROM AvailabilityCalendar a WHERE a.lockToken = :lockToken")
    void deleteByLockToken(@Param("lockToken") String lockToken);
}
