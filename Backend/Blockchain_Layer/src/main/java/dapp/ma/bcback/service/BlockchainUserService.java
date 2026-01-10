package dapp.ma.bcback.service;

import dapp.ma.bcback.controller.UserClient;
import dapp.ma.bcback.dto.BlockchainTxRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;


import java.time.Instant;

@Slf4j
@RequiredArgsConstructor
@Service
public class BlockchainUserService {

    private final UserClient userClient;

    public String registerUserOnChain(String wallet, boolean isOwner) {
        // 1. off-chain checks
        if (Boolean.FALSE.equals(userClient.existsByWallet(wallet)))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "wallet not found");
        var kyc = userClient.getKycStatus(wallet);
        if (!kyc.emailVerified() || !kyc.walletVerified())
            throw new ResponseStatusException(HttpStatus.PRECONDITION_FAILED, "KYC not satisfied");

        // 2. STUBBED: send Sepolia tx
        // Skipped in simplified mode
        log.warn("SKIPPED: RealEstateManager/PropertyRegistry not configured. Registering user stub for wallet={}", wallet);
        String txHash = "0x" + "0".repeat(64); 

        // 3. push hash back to user-service
        userClient.updateBlockchainTx(wallet, new BlockchainTxRequest(txHash, Instant.now()));
        return txHash;
    }
}
