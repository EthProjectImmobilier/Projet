package com.propertyservice.propertyservice.service;

import com.propertyservice.propertyservice.dto.AIPricingResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;

@Service
@Slf4j
public class AIService {

    private final RestTemplate restTemplate;

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    public AIService(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofMillis(500))
                .setReadTimeout(Duration.ofMillis(1000))
                .build();
    }

    public BigDecimal getSuggestedPrice(Long propertyId, LocalDate date) {
        try {
            String url = UriComponentsBuilder.fromHttpUrl(aiServiceUrl)
                    .path("/api/v1/pricing/suggest")
                    .queryParam("property_id", propertyId)
                    .queryParam("date", date.toString())
                    .toUriString();

            AIPricingResponse response = restTemplate.getForObject(url, AIPricingResponse.class);

            if (response != null) {
                log.info("AI suggested price for property {}: {} ETH", propertyId, response.getSuggested_price_eth());
                return response.getSuggested_price_eth();
            }
        } catch (Exception e) {
            log.warn("Failed to get AI pricing suggestion for property {}: {}", propertyId, e.getMessage());
        }
        return null;
    }
}
