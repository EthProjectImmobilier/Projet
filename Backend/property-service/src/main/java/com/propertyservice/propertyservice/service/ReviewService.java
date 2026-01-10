package com.propertyservice.propertyservice.service;

import com.propertyservice.propertyservice.dto.ReviewResponse;
import com.propertyservice.propertyservice.dto.UserProfileDTO;
import com.propertyservice.propertyservice.client.UserProfileClient;
import com.propertyservice.propertyservice.entity.Property;
import com.propertyservice.propertyservice.entity.Review;
import com.propertyservice.propertyservice.exception.PropertyNotFoundException;
import com.propertyservice.propertyservice.repository.PropertyRepository;
import com.propertyservice.propertyservice.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final PropertyRepository propertyRepository;
    private final UserProfileClient userProfileClient;

    @Transactional
    public ReviewResponse createReview(Long propertyId, Integer rating, String comment, Long userId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new PropertyNotFoundException("Property not found"));

        // Vérifier si l'utilisateur a déjà review cette propriété
        if (reviewRepository.existsByUserIdAndPropertyId(userId, propertyId)) {
            throw new RuntimeException("You have already reviewed this property");
        }

        // Vérifier que l'utilisateur ne review pas sa propre propriété
        if (property.getOwnerId().equals(userId)) {
            throw new RuntimeException("You cannot review your own property");
        }

        Review review = Review.builder()
                .rating(rating)
                .comment(comment)
                .userId(userId)
                .property(property)
                .build();

        Review savedReview = reviewRepository.save(review);
        log.info("Review created for property {} by user {}", propertyId, userId);

        return mapToReviewResponse(savedReview);
    }

    public Page<ReviewResponse> getPropertyReviews(Long propertyId, Pageable pageable) {
        // Vérifier que la propriété existe
        if (!propertyRepository.existsById(propertyId)) {
            throw new PropertyNotFoundException("Property not found");
        }

        return reviewRepository.findByPropertyId(propertyId, pageable)
                .map(this::mapToReviewResponse);
    }

    public Double getPropertyAverageRating(Long propertyId) {
        return reviewRepository.findAverageRatingByPropertyId(propertyId);
    }

    public Integer getPropertyReviewCount(Long propertyId) {
        return (int) reviewRepository.countByPropertyId(propertyId);
    }

    @Transactional
    public void deleteReview(Long reviewId, Long userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        // Vérifier que l'utilisateur peut supprimer cette review
        if (!review.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this review");
        }

        reviewRepository.delete(review);
        log.info("Review deleted with ID: {} by user: {}", reviewId, userId);
    }

    @Transactional
    public void adminDeleteReview(Long reviewId) {
        if (!reviewRepository.existsById(reviewId)) {
            throw new RuntimeException("Review not found");
        }
        reviewRepository.deleteById(reviewId);
        log.info("Admin deleted review {}", reviewId);
    }

    public Page<ReviewResponse> getAllReviews(Pageable pageable) {
        return reviewRepository.findAll(pageable)
                .map(this::mapToReviewResponse);
    }

    public Page<ReviewResponse> getUserReviews(Long userId, Pageable pageable) {
        return reviewRepository.findByUserId(userId, pageable)
                .map(this::mapToReviewResponse);
    }

    private ReviewResponse mapToReviewResponse(Review review) {
        ReviewResponse.ReviewResponseBuilder builder = ReviewResponse.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .userId(review.getUserId())
                .propertyId(review.getProperty().getId())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt());

        // Récupérer les infos de l'utilisateur de manière sécurisée
        try {
            UserProfileDTO userProfile = userProfileClient.getUserProfile(review.getUserId());
            if (userProfile != null) {
                String fullName = "";
                if (userProfile.getFirstName() != null) fullName += userProfile.getFirstName();
                if (userProfile.getLastName() != null) {
                    if (!fullName.isEmpty()) fullName += " ";
                    fullName += userProfile.getLastName();
                }
                
                builder.userFullName(fullName.isEmpty() ? "Utilisateur" : fullName);
                builder.userAvatarUrl(userProfile.getPhotoUrl());
            }
        } catch (Exception e) {
            log.warn("Could not fetch user profile for review {}: {}", review.getId(), e.getMessage());
            builder.userFullName("Utilisateur");
        }

        return builder.build();
    }
}
