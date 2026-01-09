package com.userservice.userservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record WalletLoginRequest(
        @NotBlank
        @Pattern(regexp = "^0x[a-fA-F0-9]{40}$")
        String address,

        @NotBlank
        @Pattern(regexp = "^0x[a-fA-F0-9]{130}$")
        String signature,

        @NotBlank
        String message
) {}
