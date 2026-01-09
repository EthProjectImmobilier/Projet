package com.userservice.userservice.dto;

import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record UpdateProfileRequest(
        @Size(max = 50) String firstName,
        @Size(max = 50) String lastName,
        @Size(max = 20) String phone,
        @Size(max = 500) String description,
        @PastOrPresent(message = "La date de naissance doit être dans le passé")
        LocalDate dateNaissance,
        @Size(max = 100) String country,
        @Size(max = 100) String city
) {}
