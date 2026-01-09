package com.userservice.userservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
    @NotBlank(message = "L'ancien mot de passe est obligatoire")
    String oldPassword,

    @NotBlank(message = "Le nouveau mot de passe est obligatoire")
    @Size(min = 6, message = "Le nouveau mot de passe doit faire au moins 6 caractères")
    String newPassword
) {}
