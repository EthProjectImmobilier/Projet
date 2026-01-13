package com.userservice.userservice.client;

import com.userservice.userservice.dto.PropertyResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class PropertyServiceClient {

    private final RestTemplate restTemplate;

    @Value("${app.property-service.url:http://localhost:8082}")
    private String propertyServiceUrl;

    public List<PropertyResponseDTO> getPropertiesByOwner(Long ownerId) {
        try {
            String url = propertyServiceUrl + "/internal/properties/owner/" + ownerId;
            log.info("Calling property-service to get properties for owner: {}", ownerId);

            ResponseEntity<List<PropertyResponseDTO>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<PropertyResponseDTO>>() {}
            );

            return response.getBody();
        } catch (Exception e) {
            log.error("Failed to fetch properties from property-service: {}", e.getMessage());
            return List.of();
        }
    }
}
