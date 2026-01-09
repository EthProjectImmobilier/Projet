// PasswordResetService.java
package com.userservice.userservice.service;

import com.userservice.userservice.dto.ForgotPasswordRequest;
import com.userservice.userservice.dto.ResetPasswordRequest;
import com.userservice.userservice.entity.User;
import com.userservice.userservice.exception.EmailSendingException;
import com.userservice.userservice.exception.InvalidCredentialsException;
import com.userservice.userservice.exception.InvalidTokenException;
import com.userservice.userservice.exception.UserNotFoundException;
import com.userservice.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public void processForgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Aucun utilisateur trouvé avec cet email : " + email));

        // Générer le token JWT
        String resetToken = jwtTokenProvider.generateResetToken(email);

        // Envoyer l'email
        sendResetPasswordEmail(user.getEmail(), resetToken);
    }

    public void processResetPassword(ResetPasswordRequest request) {
        // Valider le token
        if (!jwtTokenProvider.isValidResetToken(request.getToken())) {
            throw new InvalidTokenException("Token invalide ou expiré");
        }

        // Valider que les mots de passe correspondent
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new InvalidCredentialsException("Les mots de passe ne correspondent pas");
        }

        // Extraire l'email du token
        String email = jwtTokenProvider.extractEmailFromResetToken(request.getToken());

        // Trouver l'utilisateur
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Mettre à jour le mot de passe
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private void sendResetPasswordEmail(String email, String resetToken) {
        try {
            String resetLink = frontendUrl + "/reset-password?token=" + resetToken;

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Réinitialisation de votre mot de passe");
            message.setText(
                    "Bonjour,\n\n" +
                            "Vous avez demandé la réinitialisation de votre mot de passe.\n\n" +
                            "Cliquez sur le lien suivant pour créer un nouveau mot de passe :\n" +
                            resetLink + "\n\n" +
                            "Ce lien expirera dans 30 minutes.\n\n" +
                            "Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.\n\n" +
                            "Cordialement,\nVotre équipe de support"
            );

            mailSender.send(message);

        } catch (Exception e) {
            log.error("Erreur lors de l'envoi de l'email de réinitialisation", e);
            throw new EmailSendingException("Erreur lors de l'envoi de l'email de réinitialisation");
        }
    }
}
