package com.userservice.userservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class AssociateWalletRequest {
    @NotBlank(message = "Wallet address is required")
    @Pattern(regexp = "^0x[a-fA-F0-9]{40}$",
            message = "Invalid Ethereum address format. Must start with 0x followed by 40 hex characters")
    private String address;
}
