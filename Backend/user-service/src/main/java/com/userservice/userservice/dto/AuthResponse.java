package com.userservice.userservice.dto;

import com.userservice.userservice.entity.User;
import com.userservice.userservice.enu.RoleName;
import lombok.Data;

@Data
public class AuthResponse {
    private String token;
    private String refreshToken;
    private Long userId;
    private String email;
    private String fullName;
    private RoleName role;
    private boolean emailVerified;
    private boolean walletVerified;
    private String walletAddress;


    public AuthResponse(String token, String refreshToken, User user) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.userId = user.getId();
        this.email = user.getEmail();
        this.fullName = user.getFullName();
        this.role = user.getRole();
        this.emailVerified = user.isEmailVerified();
        this.walletVerified = user.isWalletVerified();
        this.walletAddress = user.getEthereumAddress();
    }
}
