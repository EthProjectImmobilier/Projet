package dapp.ma.bcback.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BlockchainRentalCreatedEvent {
    private Long propertyId;
    private String tenantAddress;
    private Long blockchainRentalId; // L'ID généré par le smart contract
    private String txHash;
}
