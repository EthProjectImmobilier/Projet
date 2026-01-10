package com.example.bookingservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserProfileDTO {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String photoUrl;
    private String kycRectoUrl;
    private String kycVersoUrl;
    private String walletAddress;
    private boolean walletVerified;
    
    public boolean isKycComplete() {
        return photoUrl != null && !photoUrl.trim().isEmpty()
                && kycRectoUrl != null && !kycRectoUrl.trim().isEmpty()
                && kycVersoUrl != null && !kycVersoUrl.trim().isEmpty();
    }
}
