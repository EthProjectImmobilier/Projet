package com.propertyservice.propertyservice.service;

import com.propertyservice.propertyservice.dto.AIPricingResponse;
import com.propertyservice.propertyservice.dto.AIRecommendationResponse;
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
                .setConnectTimeout(Duration.ofMillis(2000)) // 2 seconds connect
                .setReadTimeout(Duration.ofMillis(10000))   // 10 seconds read (Model training is slow)
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

    public Object getMarketTrends() {
        try {
            String url = UriComponentsBuilder.fromHttpUrl(aiServiceUrl)
                    .path("/api/v1/analytics/trends")
                    .toUriString();

            // We use Object.class here to forward the raw JSON flexibly
            return restTemplate.getForObject(url, Object.class);
        } catch (Exception e) {
            log.warn("Failed to get market trends: {}", e.getMessage());
        }
        return null;
    }

    public java.util.List<Long> getRecommendedPropertyIds(BigDecimal budget) {
        try {
            String url = UriComponentsBuilder.fromHttpUrl(aiServiceUrl)
                    .path("/api/v1/recommendations")
                    .queryParam("user_budget", budget)
                    .toUriString();

            AIRecommendationResponse response = restTemplate.getForObject(url, AIRecommendationResponse.class);

            if (response != null && response.getRecommended_property_ids() != null) {
                log.info("AI recommended properties for budget {}: {}", budget, response.getRecommended_property_ids());
                return response.getRecommended_property_ids();
            }
        } catch (Exception e) {
            log.warn("Failed to get AI recommendations for budget {}: {}", budget, e.getMessage());
        }
        return java.util.Collections.emptyList();
    }
}
