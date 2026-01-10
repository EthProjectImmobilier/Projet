package dapp.ma.bcback.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PropertyRegistrationEvent {
    private Long propertyId;
    private String owner;
    private String propertyDataHash;
    private String txHash;
}
