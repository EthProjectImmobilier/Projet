package com.gateway.gateway.filter;

import com.gateway.gateway.service.JwtTokenProvider;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.List;

@Component
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {
    private final JwtTokenProvider jwtTokenProvider;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
        super(Config.class);
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String token = extractToken(exchange.getRequest());

            // Routes publiques - pas besoin de token
            if (isPublicRoute(exchange.getRequest())) {
                return chain.filter(exchange);
            }

            // Routes protégées - vérifier le token
            if (!StringUtils.hasText(token)) {
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }

            if (!jwtTokenProvider.validateToken(token)) {
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }

            // EXTRAIRE LES INFOS
            String email = jwtTokenProvider.getEmailFromToken(token);
            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            List<String> roles = jwtTokenProvider.getRolesFromToken(token);
            String walletAddress = jwtTokenProvider.getWalletAddressFromToken(token);

            // AJOUTER LES HEADERS
            ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                    .header("X-Auth-User-Email", email != null ? email : "")
                    .header("X-Auth-User-Id", userId != null ? userId.toString() : "")
                    .header("X-Auth-Wallet-Address", walletAddress != null ? walletAddress : "")
                    .header("X-Auth-Roles", roles != null ? String.join(",", roles) : "")
                    .build();

            return chain.filter(exchange.mutate().request(mutatedRequest).build());
        };
    }

    private String extractToken(ServerHttpRequest request) {
        String bearerToken = request.getHeaders().getFirst("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    private boolean isPublicRoute(ServerHttpRequest request) {
        String path = request.getURI().getPath();
        String method = request.getMethod().name();

        // Autoriser les appels internes entre services
        if (path.startsWith("/internal/")) {
            return true;
        }

        if (path.startsWith("/api/auth/")) {
            // Liste des endpoints auth publics
            return path.equals("/api/auth/register") ||
                    path.equals("/api/auth/login") ||
                    path.equals("/api/auth/refresh") ||
                    path.equals("/api/auth/logout") ||
                    path.equals("/api/auth/forgot-password") ||
                    path.equals("/api/auth/reset-password") ||
                    path.startsWith("/api/auth/verify-email") ||
                    path.equals("/api/auth/resend-verification") ||
                    path.equals("/api/auth/login-wallet") ||
                    path.equals("/api/auth/test") ||
                    path.equals("/api/auth/verify-wallet");  // ✅ wallet verification est publique
        }
        if (path.equals("/api/properties") && "GET".equalsIgnoreCase(method)) {
            return true;
        }
        if (path.matches("/api/properties/\\d+") || path.matches("/api/properties/\\d+/booking-info")) {
            if ("GET".equalsIgnoreCase(method)) {
                return true;
            }
        }

        if (path.equals("/api/properties/me") && "GET".equalsIgnoreCase(method)) {
            return false;
        }

        if (path.startsWith("/v3/api-docs") || path.startsWith("/swagger-ui")) {
            return true;
        }
        return false;
    }

    public static class Config {
        // Configuration
    }
}
