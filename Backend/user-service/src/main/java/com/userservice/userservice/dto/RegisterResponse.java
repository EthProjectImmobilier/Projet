package com.userservice.userservice.dto;

import com.userservice.userservice.entity.User;
import com.userservice.userservice.enu.RoleName;
import lombok.Data;

@Data
public class RegisterResponse {
    private Long userId;
    private String email;
    private String fullName;
    private RoleName role;
    private boolean emailVerified;
    private String messageToSign;

    public RegisterResponse(Long userId, String email, String fullName) {
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
    }

    // ⭐ AJOUTEZ CE CONSTRUCTEUR :
    public RegisterResponse(User user) {
        this.userId = user.getId();
        this.email = user.getEmail();
        this.fullName = user.getFullName();
        this.role = user.getRole();
        this.emailVerified = user.isEmailVerified();
    }

    public RegisterResponse(User user, String messageToSign) {
        this.userId = user.getId();
        this.email = user.getEmail();
        this.fullName = user.getFullName();
        this.role = user.getRole();
        this.emailVerified = user.isEmailVerified();
        this.messageToSign = messageToSign;
    }
}
