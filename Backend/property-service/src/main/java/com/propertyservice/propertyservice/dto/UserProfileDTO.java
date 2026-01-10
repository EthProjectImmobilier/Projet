package com.propertyservice.propertyservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String photoUrl;
    private String kycRectoUrl;
    private String kycVersoUrl;
    private String ethereumAddress;
    private boolean walletVerified;
    
    public boolean isKycComplete() {
        return photoUrl != null && !photoUrl.trim().isEmpty()
                && kycRectoUrl != null && !kycRectoUrl.trim().isEmpty()
                && kycVersoUrl != null && !kycVersoUrl.trim().isEmpty();
    }
}
