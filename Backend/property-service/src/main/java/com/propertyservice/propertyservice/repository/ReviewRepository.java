package com.propertyservice.propertyservice.repository;

import com.propertyservice.propertyservice.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Trouver toutes les reviews d'une propriété
    Page<Review> findByPropertyId(Long propertyId, Pageable pageable);

    // Trouver une review spécifique d'un utilisateur sur une propriété
    Optional<Review> findByUserIdAndPropertyId(Long userId, Long propertyId);

    // Calculer la note moyenne d'une propriété
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.property.id = :propertyId")
    Double findAverageRatingByPropertyId(@Param("propertyId") Long propertyId);

    // Compter le nombre de reviews d'une propriété
    long countByPropertyId(Long propertyId);

    // Vérifier si un utilisateur a déjà review une propriété
    boolean existsByUserIdAndPropertyId(Long userId, Long propertyId);

    // Trouver les reviews d'un utilisateur
    Page<Review> findByUserId(Long userId, Pageable pageable);

    // Trouver les dernières reviews (pour la homepage)
    Page<Review> findByOrderByCreatedAtDesc(Pageable pageable);
}