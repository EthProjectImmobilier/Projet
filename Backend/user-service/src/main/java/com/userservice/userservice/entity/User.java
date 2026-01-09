package com.userservice.userservice.entity;

import com.userservice.userservice.enu.RoleName;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;

@Entity
@Table(name = "users",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "email"),
                @UniqueConstraint(columnNames = "phone"),
                @UniqueConstraint(columnNames = "ethereum_address")
        })
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    @Column(nullable = true)
    private String password; // Hashé avec bcrypt

    @Column(length = 500)
    private String description; // ✅ Nouveau

    @Column(name = "date_naissance")
    private LocalDate dateNaissance; // ✅ Nouveau - LocalDate au lieu de String

    private String country; // ✅ Nouveau
    private String city; // ✅ Nouveau

    // Email verification fields (au lieu de table séparée)
    @Column(name = "email_verification_token")
    private String emailVerificationToken; // ✅ Nouveau - token hashé

    @Column(name = "email_token_expiry")
    private LocalDateTime emailTokenExpiry; // ✅ Nouveau

    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified = false;

    // Single role instead of ManyToMany
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private RoleName role = RoleName.ROLE_TENANT; // ✅ Simplifié - rôle par défaut

    @Column(name = "is_enabled", nullable = false)
    private boolean enabled = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "ethereum_address", unique = true, length = 42)
    private String ethereumAddress;

    @Column(name = "is_wallet_verified")
    private boolean walletVerified = false;

    @Column(name = "wallet_verification_message", length = 500)
    private String walletVerificationMessage;

    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    @Column(name = "kyc_recto_url", length = 500)
    private String kycRectoUrl;

    @Column(name = "kyc_verso_url", length = 500)
    private String kycVersoUrl;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // ✅ Simplifié : retourne juste le rôle unique
        return Collections.singletonList(new SimpleGrantedAuthority(role.name()));
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return this.enabled;
    }

    // ✅ Méthode pour vérifier si le token email est valide
    public boolean isEmailTokenValid() {
        return emailVerificationToken != null &&
                emailTokenExpiry != null &&
                LocalDateTime.now().isBefore(emailTokenExpiry);
    }

    // ✅ Méthode pour mettre à jour le token de vérification
    public void setEmailVerificationToken(String token, int expiryHours) {
        this.emailVerificationToken = token;
        this.emailTokenExpiry = LocalDateTime.now().plusHours(expiryHours);
        this.emailVerified = false;
    }

    // ✅ Méthode pour vérifier l'email
    public boolean verifyEmail(String token) {
        if (emailVerificationToken != null &&
                emailVerificationToken.equals(token) &&
                isEmailTokenValid()) {
            this.emailVerified = true;
            this.emailVerificationToken = null;
            this.emailTokenExpiry = null;
            return true;
        }
        return false;
    }

    public String getWalletVerificationMessage() {
        return walletVerificationMessage;
    }

    public void setWalletVerificationMessage(String walletVerificationMessage) {
        this.walletVerificationMessage = walletVerificationMessage;
    }
}
