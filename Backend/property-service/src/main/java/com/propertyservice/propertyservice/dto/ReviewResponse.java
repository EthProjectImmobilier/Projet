package com.propertyservice.propertyservice.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReviewResponse {
    private Long id;
    private Integer rating;
    private String comment;
    private Long userId;
    private Long propertyId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Info utilisateur (à récupérer du User Service)
    private String userFullName;
    private String userAvatarUrl;
}
