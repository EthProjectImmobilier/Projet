package com.userservice.userservice.dto;

import com.userservice.userservice.enu.RoleName;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private boolean enabled;
    private boolean emailVerified;
    private boolean walletVerified;
    private RoleName role;
    private String description;
    private LocalDate dateNaissance;
    private String country;
    private String city;
    private String phone;
    private String walletAddress; // ← AJOUTÉ ICI
    private String photoUrl;
    private String kycRectoUrl;
    private String kycVersoUrl;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
}
