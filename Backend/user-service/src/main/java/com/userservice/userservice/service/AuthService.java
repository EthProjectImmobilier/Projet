package com.userservice.userservice.service;

import com.userservice.userservice.dto.*;
import com.userservice.userservice.entity.RefreshToken;
import com.userservice.userservice.entity.User;
import com.userservice.userservice.enu.RoleName;
import com.userservice.userservice.exception.*;
import com.userservice.userservice.repository.UserRepository;
import com.userservice.userservice.util.SignatureUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        if (userService.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        if (request.getWalletAddress() != null && !request.getWalletAddress().trim().isEmpty()) {
            user.setEthereumAddress(request.getWalletAddress());
        } else {
            user.setEthereumAddress(null);
        }
        
        user.setEnabled(true);
        user.setEmailVerified(false);

        try {
            RoleName roleName = RoleName.valueOf(request.getRole().toUpperCase());
            if (roleName == RoleName.ROLE_ADMIN) {
                // Bloquer la création de compte admin via l'endpoint public
                throw new IllegalArgumentException("Registration as ADMIN is not allowed");
            }
            user.setRole(roleName);
        } catch (IllegalArgumentException e) {
            // Par défaut ou en cas d'erreur/tentative illégale -> TENANT
            user.setRole(RoleName.ROLE_TENANT);
        }

        user.setDescription(request.getDescription());
        user.setDateNaissance(request.getDateNaissance());
        user.setCountry(request.getCountry());
        user.setCity(request.getCity());

        // Générer le token de vérification email
        // Générer le token de vérification email
        String rawToken = UUID.randomUUID().toString();
        String hashedToken = hashToken(rawToken);
        user.setEmailVerificationToken(hashedToken, 24);

        // Générer un message unique pour la vérification du wallet
        String nonce = UUID.randomUUID().toString();
        String message = "Veuillez signer ce message pour prouver la possession de votre wallet : " + nonce;
        user.setWalletVerificationMessage(message);
        user.setWalletVerified(false);

        User savedUser = userRepository.save(user);

        // Envoyer l'email de vérification (AVEC LE TOKEN BRUT)
        sendVerificationEmail(savedUser, rawToken);

        return new RegisterResponse(savedUser, message);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        if (!user.isEnabled()) {
            throw new UserDisabledException("User account is disabled");
        }

        if (!user.isEmailVerified()) {
            throw new EmailNotVerifiedException("Email address not verified");
        }

        String token = jwtTokenProvider.generateToken(user);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        // Mettre à jour le dernier login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        return new AuthResponse(
                token,
                refreshToken.getToken(),
                user
        );
    }

    public AuthResponse refreshToken(String refreshToken) {
        RefreshToken token = refreshTokenService.findByToken(refreshToken)
                .orElseThrow(() -> new InvalidTokenException("Refresh token not found"));

        refreshTokenService.verifyExpiration(token);

        User user = token.getUser();
        String newJwtToken = jwtTokenProvider.generateToken(user);
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user.getId());

        return new AuthResponse(
                newJwtToken,
                newRefreshToken.getToken(),
                user
        );
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Utilisateur non trouvé"));

        // 1. Vérifier si l'ancien mot de passe est correct
        if (!passwordEncoder.matches(request.oldPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("L'ancien mot de passe est incorrect");
        }

        // 2. Mettre à jour avec le nouveau mot de passe
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenService.revokeToken(refreshToken);
    }

    @Transactional
    public String generateWalletVerificationMessage(String address) {
        User user = userRepository.findByEthereumAddress(address)
                .orElseThrow(() -> new UserNotFoundException("Wallet not registered"));

        String nonce = UUID.randomUUID().toString();
        String message = "Veuillez signer ce message pour prouver la possession de votre wallet : " + nonce;

        user.setWalletVerificationMessage(message);
        userRepository.save(user);

        return message;
    }

    public AuthResponse loginWithWallet(WalletLoginRequest request) {
        User user = userRepository.findByEthereumAddress(request.address())
                .orElseThrow(() -> new UserNotFoundException("Wallet not registered"));

        if (!user.isEnabled()) {
            throw new UserDisabledException("User account is disabled");
        }

        if (!user.isEmailVerified()) {
            throw new EmailNotVerifiedException("Email address not verified");
        }

        if (!user.isWalletVerified()) {
            System.err.println("⚠️ Wallet non vérifié pour: " + user.getEmail());
            throw new InvalidActionException("Wallet not verified. Please verify first.");
        }

        // 3. Vérifier la signature
        System.out.println("🔄 Vérification de la signature...");
        boolean signatureValid = verifySignature(request.message(), request.signature(), request.address());

        if (!signatureValid) {
            System.err.println("❌ Signature invalide pour: " + request.address());
            throw new WalletSignatureException("Invalid signature");
        }

        System.out.println("✅ Signature valide !");

        // 4. Continuer avec l'authentification
        if (!user.isEnabled()) {
            throw new UserDisabledException("User account is disabled");
        }

        String token = jwtTokenProvider.generateToken(user);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        return new AuthResponse(
                token,
                refreshToken.getToken(),
                user
        );
    }

    @Transactional
    public String verifyEmail(String token) {
        String hashedToken = hashToken(token);
        User user = userRepository.findByEmailVerificationToken(hashedToken)
                .orElseThrow(() -> new InvalidTokenException("Token invalide ou expiré"));

        if (user.verifyEmail(hashedToken)) {
            userRepository.save(user);
            return "Email vérifié avec succès";
        } else {
            throw new InvalidTokenException("Token expiré");
        }
    }

    @Transactional
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Utilisateur non trouvé"));

        if (user.isEmailVerified()) {
            throw new InvalidActionException("Email déjà vérifié");
        }

        String rawToken = UUID.randomUUID().toString();
        String hashedToken = hashToken(rawToken);
        user.setEmailVerificationToken(hashedToken, 24);
        userRepository.save(user);

        sendVerificationEmail(user, rawToken);
    }

    public UserResponse getCurrentUser(Long userId) {
        return userService.getCurrentUserDto(userId);
    }

    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        return userService.updateProfile(userId, request);
    }

    @Transactional
    public void createTestAdmin() {
        if (!userRepository.existsByEmail("admin@test.com")) {
            User admin = new User();
            admin.setFirstName("Admin");
            admin.setLastName("Test");
            admin.setEmail("admin@test.com");
            admin.setPhone("+1234567890");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setEnabled(true);
            admin.setEmailVerified(true);
            admin.setRole(RoleName.ROLE_ADMIN);
            userRepository.save(admin);
        }
    }

    @Transactional
    public void createTestUser() {
        if (!userRepository.existsByEmail("user@test.com")) {
            User user = new User();
            user.setFirstName("User");
            user.setLastName("Test");
            user.setEmail("user@test.com");
            user.setPhone("+0987654321");
            user.setPassword(passwordEncoder.encode("user123"));
            user.setEnabled(true);
            user.setEmailVerified(true);
            user.setRole(RoleName.ROLE_TENANT);
            userRepository.save(user);
        }
    }

    @Transactional
    public void createTestUsersByWallet() {
        if (!userRepository.existsByEthereumAddress("0x1234567890123456789012345678901234567890")) {
            User walletUser = new User();
            walletUser.setFirstName("Wallet");
            walletUser.setLastName("User");
            walletUser.setEmail("wallet@test.com");
            walletUser.setEthereumAddress("0x1234567890123456789012345678901234567890");
            walletUser.setEnabled(true);
            walletUser.setEmailVerified(true);
            walletUser.setRole(RoleName.ROLE_TENANT);
            userRepository.save(walletUser);
        }
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Erreur de hachage du token", e);
        }
    }

    @Transactional
    public void forceLogoutUser(Long userId) {
        refreshTokenService.revokeAllUserTokens(userId);
    }

    @org.springframework.beans.factory.annotation.Value("${app.verification-base-url:http://localhost:8081}")
    private String verificationBaseUrl;

    private void sendVerificationEmail(User user, String token) {
        String verificationUrl = verificationBaseUrl + "/api/auth/verify-email?token=" + token;

        SimpleMailMessage email = new SimpleMailMessage();
        email.setTo(user.getEmail());
        email.setSubject("Vérification de votre email");
        email.setText("Bonjour " + user.getFullName() + ",\n\n" +
                "Cliquez sur ce lien pour vérifier votre email: " + verificationUrl + "\n\n" +
                "Ce lien expirera dans 24 heures.\n\n" +
                "Cordialement,\nL'équipe Real Estate");

        mailSender.send(email);
    }

    private boolean verifySignature(String message, String signature, String address) {
        try {// Utiliser votre SignatureUtils
            String recoveredAddress = SignatureUtils.recoverAddressFromSignature(message, signature);

            System.out.println("🔍 Adresse récupérée: " + recoveredAddress);

            if (recoveredAddress == null) {
                System.err.println("❌ Impossible de récupérer l'adresse");
                return false;
            }

            // Comparer les adresses (case-insensitive)
            boolean isValid = recoveredAddress.equalsIgnoreCase(address.toLowerCase());

            System.out.println("✅ Résultat vérification: " + isValid);
            return isValid;

        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la vérification: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    @Transactional
    public String verifyWallet(VerifyWalletRequest request) {
        System.out.println("🔄 Vérification wallet...");
        System.out.println("👛 Address: " + request.getAddress());
        System.out.println("✍️ Signature: " + request.getSignature());

        // Trouver l'utilisateur par l'adresse wallet
        User user = userRepository.findByEthereumAddress(request.getAddress())
                .orElseThrow(() -> {
                    System.err.println("❌ Wallet non trouvé: " + request.getAddress());
                    return new UserNotFoundException("Wallet not registered");
                });

        System.out.println("✅ Utilisateur trouvé: " + user.getEmail());

        // Vérifier que l'utilisateur a un message de vérification
        if (user.getWalletVerificationMessage() == null) {
            throw new InvalidActionException("No pending verification for this wallet");
        }

        // Vérifier la signature
        boolean signatureValid = verifySignature(
                user.getWalletVerificationMessage(),
                request.getSignature(),
                request.getAddress()
        );

        if (!signatureValid) {
            System.err.println("❌ Signature invalide");
            throw new WalletSignatureException("Invalid signature");
        }

        // ✅ METTRE walletVerified À TRUE
        user.setWalletVerified(true);
        user.setWalletVerificationMessage(null); // Nettoyer le message
        userRepository.save(user);

        System.out.println("✅ Wallet vérifié pour: " + user.getEmail());

        return "Wallet verified successfully";
    }

    @Transactional
    public String associateWallet(Long userId, AssociateWalletRequest request) {
        System.out.println("🔗 Association wallet...");
        System.out.println("👤 User ID: " + userId);
        System.out.println("👛 Address: " + request.getAddress());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // Vérifier si le wallet est déjà utilisé
        if (userRepository.existsByEthereumAddress(request.getAddress())) {
            throw new InvalidActionException("Wallet address already registered");
        }

        // Générer un message unique pour la signature
        String nonce = UUID.randomUUID().toString();
        String message = "Associate wallet to " + user.getEmail() + ": " + nonce;

        // Associer le wallet (mais pas encore vérifié)
        user.setEthereumAddress(request.getAddress());
        user.setWalletVerificationMessage(message);
        user.setWalletVerified(false); // ← False par défaut
        userRepository.save(user);

        System.out.println("✅ Wallet associé (non vérifié)");
        System.out.println("📝 Message à signer: " + message);

        return message; // Retourner le message à signer
    }
}
