package com.userservice.userservice.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateUserRequest {

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Phone is required") // ← Maintenant obligatoire comme RegisterRequest
    @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Phone number should be valid")
    private String phone;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Role is required")
    private String role = "ROLE_TENANT";

    @Pattern(regexp = "^(0x[a-fA-F0-9]{40})?$",
            message = "Invalid Ethereum address format")
    private String walletAddress;
    private String description;
    @NotNull(message = "La date de naissance est obligatoire")
    @PastOrPresent(message = "La date de naissance doit être dans le passé")
    private LocalDate dateNaissance;

    @NotBlank(message = "Le pays est obligatoire")
    private String country;

    @NotBlank(message = "La ville est obligatoire")
    private String city;
}
