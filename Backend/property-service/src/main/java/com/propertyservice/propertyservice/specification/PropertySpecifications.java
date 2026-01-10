package com.propertyservice.propertyservice.specification;

import com.propertyservice.propertyservice.entity.Property;
import com.propertyservice.propertyservice.enu.ListingStatus;
import com.propertyservice.propertyservice.enu.AvailabilityStatus;
import com.propertyservice.propertyservice.enu.PropertyType;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class PropertySpecifications {
    public static Specification<Property> isAvailable() {
        return (root, query, cb) ->
                cb.equal(root.get("status"), ListingStatus.ACTIVE);
    }

    // Ville
    public static Specification<Property> hasCity(String city) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(city)) return null;
            return cb.equal(root.get("address").get("city"), city);
        };
    }

    // Pays
    public static Specification<Property> hasCountry(String country) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(country)) return null;
            return cb.equal(root.get("address").get("country"), country);
        };
    }

    // Type de propriété
    public static Specification<Property> hasPropertyType(PropertyType type) {
        return (root, query, cb) -> {
            if (type == null) return null;
            return cb.equal(root.get("type"), type);
        };
    }

    // Nombre de voyageurs
    public static Specification<Property> canAccommodateGuests(Integer guests) {
        return (root, query, cb) -> {
            if (guests == null || guests <= 0) return null;
            return cb.greaterThanOrEqualTo(root.get("maxGuests"), guests);
        };
    }

    // Nombre de chambres
    public static Specification<Property> hasMinBedrooms(Integer bedrooms) {
        return (root, query, cb) -> {
            if (bedrooms == null || bedrooms <= 0) return null;
            return cb.greaterThanOrEqualTo(root.get("bedrooms"), bedrooms);
        };
    }

    // Nombre de salles de bain
    public static Specification<Property> hasMinBathrooms(Integer bathrooms) {
        return (root, query, cb) -> {
            if (bathrooms == null || bathrooms <= 0) return null;
            return cb.greaterThanOrEqualTo(root.get("bathrooms"), bathrooms);
        };
    }

    // Prix minimum
    public static Specification<Property> hasMinPrice(BigDecimal minPrice) {
        return (root, query, cb) -> {
            if (minPrice == null || minPrice.compareTo(BigDecimal.ZERO) <= 0) return null;
            return cb.greaterThanOrEqualTo(root.get("pricePerNight"), minPrice);
        };
    }

    // Prix maximum
    public static Specification<Property> hasMaxPrice(BigDecimal maxPrice) {
        return (root, query, cb) -> {
            if (maxPrice == null || maxPrice.compareTo(BigDecimal.ZERO) <= 0) return null;
            return cb.lessThanOrEqualTo(root.get("pricePerNight"), maxPrice);
        };
    }

    // Réservation instantanée
    public static Specification<Property> isInstantBookable(Boolean instantBookable) {
        return (root, query, cb) -> {
            if (instantBookable == null) return null;
            return cb.equal(root.get("instantBookable"), instantBookable);
        };
    }

    // Équipements (un ou plusieurs)
    public static Specification<Property> hasAmenities(List<String> amenities) {
        return (root, query, cb) -> {
            if (amenities == null || amenities.isEmpty()) return null;

            List<Predicate> predicates = new ArrayList<>();
            for (String amenity : amenities) {
                predicates.add(cb.isMember(amenity, root.get("amenities")));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    // Disponibilité entre dates (IMPORTANT !)
    public static Specification<Property> availableBetween(LocalDate startDate, LocalDate endDate) {
        return (root, query, cb) -> {
            if (startDate == null || endDate == null) return null;

            // Sous-requête pour vérifier disponibilités
            var subquery = query.subquery(Long.class);
            var availabilityRoot = subquery.from(com.propertyservice.propertyservice.entity.AvailabilityCalendar.class);

            subquery.select(cb.count(availabilityRoot));
            subquery.where(
                    cb.and(
                            cb.equal(availabilityRoot.get("property").get("id"), root.get("id")),
                            cb.equal(availabilityRoot.get("status"), AvailabilityStatus.AVAILABLE),
                            cb.between(availabilityRoot.get("date"), startDate, endDate.minusDays(1))
                    )
            );

            // Doit avoir toutes les dates disponibles
            long requiredDays = startDate.until(endDate).getDays();
            return cb.equal(subquery, requiredDays);
        };
    }

    // Note minimum (complexe - besoin de join avec reviews)
    public static Specification<Property> hasMinRating(Double minRating) {
        return (root, query, cb) -> {
            if (minRating == null || minRating < 0 || minRating > 5) return null;

            query.distinct(true); // Éviter les doublons

            // Sous-requête pour la moyenne des reviews
            var subquery = query.subquery(Double.class);
            var reviewRoot = subquery.from(com.propertyservice.propertyservice.entity.Review.class);

            subquery.select(cb.avg(reviewRoot.get("rating")));
            subquery.where(cb.equal(reviewRoot.get("property").get("id"), root.get("id")));

            return cb.greaterThanOrEqualTo(subquery, minRating);
        };
    }

    public static Specification<Property> inLocation(String location) {
        return (root, query, cb) -> {
            if (location == null || location.isBlank()) return null;

            String searchPattern = "%" + location.toLowerCase() + "%";

            return cb.or(
                    cb.like(cb.lower(root.get("address").get("city")), searchPattern),
                    cb.like(cb.lower(root.get("address").get("country")), searchPattern),
                    cb.like(cb.lower(root.get("title")), searchPattern)
            );
        };
    }
}
