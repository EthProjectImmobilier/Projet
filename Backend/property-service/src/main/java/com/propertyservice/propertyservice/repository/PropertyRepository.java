package com.propertyservice.propertyservice.repository;

import com.propertyservice.propertyservice.enu.ListingStatus;
import com.propertyservice.propertyservice.enu.PropertyType;
import com.propertyservice.propertyservice.entity.Property;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long>, JpaSpecificationExecutor<Property> {

    // Trouver les propriétés d'un owner
    Page<Property> findByOwnerId(Long ownerId, Pageable pageable);

    Page<Property> findByStatus(ListingStatus status, Pageable pageable);

    long countByStatus(ListingStatus status);

    // Trouver les propriétés disponibles par type
    Page<Property> findByTypeAndStatus(PropertyType type, ListingStatus status, Pageable pageable);

    // Vérifier si une propriété appartient à un owner
    boolean existsByIdAndOwnerId(Long id, Long ownerId);

    // Recherche par ville
    Page<Property> findByAddressCityAndStatus(String city, ListingStatus status, Pageable pageable);

    // Recherche avancée avec prix
    @Query("SELECT p FROM Property p WHERE " +
            "p.status = :status AND " +
            "p.pricePerNight BETWEEN :minPrice AND :maxPrice AND " +
            "p.maxGuests >= :minGuests")
    Page<Property> findAvailableProperties(
            @Param("status") ListingStatus status,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("minGuests") Integer minGuests,
            Pageable pageable);

    // Compter les propriétés d'un owner
    long countByOwnerId(Long ownerId);

    @Query("SELECT DISTINCT p.address.city FROM Property p WHERE p.status = 'ACTIVE' ORDER BY p.createdAt DESC")
    List<String> findPopularCities(@Param("limit") int limit);

    // Compter par type
    long countByTypeAndStatus(PropertyType type, ListingStatus status);

    // Trouver les prix min/max pour une ville
    @Query("SELECT MIN(p.pricePerNight), MAX(p.pricePerNight) FROM Property p " +
            "WHERE p.status = 'ACTIVE' AND p.address.city = :city")
    List<Object[]> findPriceRangeByCity(@Param("city") String city);

    // Recherche textuelle (titre, description, ville)
    @Query("SELECT p FROM Property p WHERE " +
            "p.status = 'ACTIVE' AND " +
            "(LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.address.city) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Property> searchByText(@Param("query") String query, Pageable pageable);
}
