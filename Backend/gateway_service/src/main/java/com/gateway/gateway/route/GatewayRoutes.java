package com.gateway.gateway.route;

import com.gateway.gateway.filter.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayRoutes {

    @Value("${app.services.user-service.uri:http://localhost:8081}")
    private String userServiceUri;

    @Value("${app.services.property-service.uri:http://localhost:8082}")
    private String propertyServiceUri;

    @Value("${app.services.booking-service.uri:http://localhost:8083}")
    private String bookingServiceUri;

    @Value("${app.services.payment-service.uri:http://localhost:8084}")
    private String paymentServiceUri;

    @Value("${app.services.blockchain-service.uri:http://localhost:8085}")
    private String blockchainServiceUri;

    @Value("${app.services.notification-service.uri:http://localhost:8086}")
    private String notificationServiceUri;

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder, JwtAuthenticationFilter jwtAuthenticationFilter) {
        return builder.routes()
                .route("user_service_protected_auth", r -> r
                        .path("/api/auth/me", "/api/auth/associate-wallet", "/api/auth/change-password")
                        .filters(f -> f.filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri(userServiceUri)
                )
                // Routes publiques d'authentification
                .route("user_service_public", r -> r
                        .path("/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/refresh",
                                "/api/auth/logout",
                                "/api/auth/forgot-password",
                                "/api/auth/reset-password",
                                "/api/auth/verify-email",
                                "/api/auth/resend-verification",
                                "/api/auth/login-wallet",
                                "/api/auth/test",
                                "/api/auth/verify-wallet",
                                "/api/auth/check-email",
                                "/api/auth/check-wallet",
                                "/api/auth/generate-wallet-message")
                        .uri(userServiceUri)
                )
                // Route catch-all pour autres endpoints auth (s'ils existent)
                .route("user_service_auth_other", r -> r
                        .path("/api/auth/**")
                        .filters(f -> f.filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri(userServiceUri)
                )
                .route("property_admin", r -> r
                        .path("/api/admin/properties/**", "/api/admin/reviews/**")
                        .filters(f -> f.filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri(propertyServiceUri)
                )
                .route("user_service_protected", r -> r
                        .path("/api/admin/**")
                        .filters(f -> f
                                .filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri(userServiceUri)
                )
                .route("user_service_me", r -> r
                        .path("/api/users/me", "/api/users/me/**", "/api/users/upload")
                        .filters(f -> f.filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri(userServiceUri)
                )
                .route("property_service_me", r -> r
                        .path("/api/properties/me")
                        .and()
                        .method("GET")
                        .filters(f -> f.filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri(propertyServiceUri)
                )
                .route("property_service_public", r -> r
                        .path("/api/properties", "/api/properties/{id}", "/api/properties/{id}/booking-info", "/api/properties/*/reviews/**")
                        .and()
                        .method("GET")
                        .uri(propertyServiceUri)
                )
                .route("property_search_public", r -> r
                        .path("/api/properties/search", "/api/properties/search/**")
                        .and()
                        .method("GET")
                        .uri(propertyServiceUri)
                )
                .route("property_service_protected", r -> r
                        .path("/api/properties/**")
                        .and()
                        .method("POST", "PUT", "DELETE")
                        .filters(f -> f.filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri(propertyServiceUri)
                )
                .route("property_images_protected", r -> r
                        .path("/api/properties/*/images/**")
                        .filters(f -> f.filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri(propertyServiceUri)
                )
                .route("property_availability_protected", r -> r
                        .path("/api/properties/*/availability/**")
                        .filters(f -> f.filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri(propertyServiceUri)
                )
                .route("booking_service", r -> r
                        .path("/api/bookings/**")
                        .filters(f -> f.filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri(bookingServiceUri)
                )
                .route("payment_service", r -> r
                        .path("/api/payments/**")
                        .filters(f -> f.filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri(paymentServiceUri)
                )
                .route("payment_webhook_public", r -> r
                        .path("/api/webhooks/payment/**")
                        .uri(paymentServiceUri)
                )
                .route("blockchain_service", r -> r
                        .path("/bc/**")
                        .filters(f -> f.filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri(blockchainServiceUri)
                )
                .route("notification_service", r -> r
                        .path("/api/notifications/**")
                        .filters(f -> f.filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri(notificationServiceUri)
                )
                // ROUTES INTERNES (Service-to-Service)
                .route("booking_service_internal", r -> r
                        .path("/internal/bookings/**")
                        .uri(bookingServiceUri)
                )
                .route("user_service_internal", r -> r
                        .path("/internal/users/**")
                        .uri(userServiceUri)
                )
                .route("property_service_internal", r -> r
                        .path("/internal/properties/**")
                        .uri(propertyServiceUri)
                )
                .route("swagger", r -> r
                        .path("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html")
                        .uri(userServiceUri)
                )
                .route("user_service_files", r -> r
                        .path("/files/**")
                        .uri(userServiceUri)
                )
                .build();
    }
}
