package com.userservice.userservice.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Order(1)
public class InternalAuthFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;
        String path = req.getRequestURI();
        String rolesHeader = req.getHeader("X-Auth-Roles");

        if (path.startsWith("/api/auth/") || 
                path.startsWith("/internal/") ||
                path.startsWith("/files/") ||
                path.equals("/actuator/health") ||
                path.equals("/swagger-ui.html") ||
                path.startsWith("/swagger-ui") ||
                path.startsWith("/v3/api-docs") ||
                path.matches("/api/users/\\d+")) { // Allow GET /api/users/{id} for inter-service calls
            chain.doFilter(request, response);
            return;
        }

        String userId = req.getHeader("X-Auth-User-Id");
        if (userId == null || userId.isBlank()) {
            res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing X-Auth-User-Id");
            return;
        }
        if (path.startsWith("/api/admin/")) {
            if (rolesHeader == null || !rolesHeader.contains("ROLE_ADMIN")) {
                res.sendError(HttpServletResponse.SC_FORBIDDEN, "Admin role required");
                return;
            }
        }
        try {
            Long.valueOf(userId);
        } catch (NumberFormatException e) {
            res.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid user id");
            return;
        }
        chain.doFilter(request, response);
    }
}
