package com.propertyservice.propertyservice.client;

import com.propertyservice.propertyservice.dto.UserProfileDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserProfileClient {

    private final RestTemplate restTemplate;
    
    @org.springframework.beans.factory.annotation.Value("${app.services.user-service-url:http://localhost:8081}")
    private String userServiceUrl;

    public UserProfileDTO getUserProfile(Long userId) {
        try {
            String url = userServiceUrl + "/api/users/" + userId;
            log.info("Calling user-service to get profile for user: {}", userId);
            
            // Récupérer la réponse comme Map pour éviter les problèmes de désérialisation
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            
            if (response == null) {
                throw new RuntimeException("User not found");
            }
            
            // Mapper vers UserProfileDTO
            UserProfileDTO profile = UserProfileDTO.builder()
                    .id(getLong(response, "id"))
                    .email((String) response.get("email"))
                    .firstName((String) response.get("firstName"))
                    .lastName((String) response.get("lastName"))
                    .photoUrl((String) response.get("photoUrl"))
                    .kycRectoUrl((String) response.get("kycRectoUrl"))
                    .kycVersoUrl((String) response.get("kycVersoUrl"))
                    .ethereumAddress((String) response.get("walletAddress")) // ✅ User-Service retourne "walletAddress"
                    .walletVerified(getBoolean(response, "walletVerified"))
                    .build();
            
            log.info("User profile retrieved: {}", profile);
            return profile;
        } catch (Exception e) {
            log.error("❌ Failed to retrieve user profile for userId: {}. URL: {}/api/users/{}. Error: {}", 
                    userId, userServiceUrl, userId, e.getMessage(), e);
            throw new RuntimeException("Unable to verify user profile: " + e.getMessage());
        }
    }
    
    public List<UserProfileDTO> getUsersByIds(List<Long> userIds) {
        try {
            String url = userServiceUrl + "/api/users/batch";
            log.info("Calling user-service to get profiles for {} users", userIds.size());

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> response = restTemplate.postForObject(url, userIds, List.class);

            if (response == null) {
                return List.of();
            }

            return response.stream().map(map -> UserProfileDTO.builder()
                    .id(getLong(map, "id"))
                    .email((String) map.get("email"))
                    .firstName((String) map.get("firstName"))
                    .lastName((String) map.get("lastName"))
                    .photoUrl((String) map.get("photoUrl"))
                    .kycRectoUrl((String) map.get("kycRectoUrl"))
                    .kycVersoUrl((String) map.get("kycVersoUrl"))
                    .ethereumAddress((String) map.get("walletAddress"))
                    .walletVerified(getBoolean(map, "walletVerified"))
                    .build()).toList();
        } catch (Exception e) {
            log.error("❌ Failed to retrieve user profiles. Error: {}", e.getMessage());
            return List.of();
        }
    }

    private Long getLong(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value instanceof Integer) {
            return ((Integer) value).longValue();
        }
        return (Long) value;
    }
    
    private boolean getBoolean(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value != null && (Boolean) value;
    }
}
