package com.propertyservice.propertyservice.repository;

import com.propertyservice.propertyservice.entity.PropertyImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyImageRepository extends JpaRepository<PropertyImage, Long> {

    // Trouver toutes les images d'une propriété
    List<PropertyImage> findByPropertyIdOrderByDisplayOrderAsc(Long propertyId);

    // Trouver une image spécifique d'une propriété
    Optional<PropertyImage> findByIdAndPropertyId(Long id, Long propertyId);

    // Supprimer toutes les images d'une propriété
    @Modifying
    @Query("DELETE FROM PropertyImage pi WHERE pi.property.id = :propertyId")
    void deleteByPropertyId(@Param("propertyId") Long propertyId);

    // Compter les images d'une propriété
    long countByPropertyId(Long propertyId);

    // Trouver l'image principale (première par ordre d'affichage)
    Optional<PropertyImage> findFirstByPropertyIdOrderByDisplayOrderAsc(Long propertyId);
}
