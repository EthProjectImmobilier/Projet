package com.userservice.userservice.controller;

import com.userservice.userservice.dto.*;
import com.userservice.userservice.service.AuthService;
import com.userservice.userservice.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.hibernate.validator.constraints.Email;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;
    private final com.userservice.userservice.service.UserService userService;


    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        RegisterResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@Valid @RequestBody RefreshTokenRequest request) {
        authService.logout(request.getRefreshToken());
        return ResponseEntity.ok("Logged out successfully");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.processForgotPassword(request);
        return ResponseEntity.ok("Un email de réinitialisation a été envoyé");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.processResetPassword(request);
        return ResponseEntity.ok("Mot de passe réinitialisé avec succès");
    }

    @GetMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@RequestParam String token) {
        // ✅ MODIFIER : Appeler directement AuthService
        String message = authService.verifyEmail(token);
        return ResponseEntity.ok(message);
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<String> resendVerification(@RequestParam @Email String email) {
        // ✅ MODIFIER : Appeler directement AuthService
        authService.resendVerificationEmail(email);
        return ResponseEntity.ok("Email de vérification renvoyé");
    }

    @PostMapping("/login-wallet")
    public ResponseEntity<AuthResponse> loginWithWallet(@Valid @RequestBody WalletLoginRequest request) {
        AuthResponse response = authService.loginWithWallet(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/test")
    public ResponseEntity<java.util.Map<String, String>> createTestAdmin() {
        authService.createTestAdmin();
        authService.createTestUser();
        authService.createTestUsersByWallet();
        
        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("message", "Données de test initialisées avec succès");
        response.put("admin", "admin@test.com");
        response.put("user", "user@test.com");
        response.put("wallet_user", "0x1234567890123456789012345678901234567890");
        
        return ResponseEntity.ok(response);
    }





    @PostMapping("/associate-wallet")
    public ResponseEntity<?> associateWallet(
            @RequestHeader("X-Auth-User-Id") Long userId,
            @Valid @RequestBody AssociateWalletRequest request) {

        String message = authService.associateWallet(userId, request);
        return ResponseEntity.ok(message);
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestHeader("X-Auth-User-Id") Long userId,
            @Valid @RequestBody ChangePasswordRequest request) {

        authService.changePassword(userId, request);
        return ResponseEntity.ok("Mot de passe mis à jour avec succès");
    }

    @PostMapping("/generate-wallet-message")
    public ResponseEntity<String> generateWalletMessage(
            @RequestParam String address) {
        
        String message = authService.generateWalletVerificationMessage(address);
        return ResponseEntity.ok(message);
    }

    @PostMapping("/verify-wallet")
    public ResponseEntity<?> verifyWallet(
            @Valid @RequestBody VerifyWalletRequest request) {

        String message = authService.verifyWallet(request);
        return ResponseEntity.ok(message);
    }

    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmailExists(@RequestParam String email) {
        boolean exists = userService.existsByEmail(email);
        return ResponseEntity.ok(exists);
    }

    @GetMapping("/check-wallet")
    public ResponseEntity<Boolean> checkWalletExists(@RequestParam String walletAddress) {
        boolean exists = userService.findByEthereumAddress(walletAddress).isPresent();
        return ResponseEntity.ok(exists);
    }
}
