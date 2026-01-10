package dapp.ma.bcback.controller;

import dapp.ma.bcback.config.UserClientConfig;
import dapp.ma.bcback.dto.BlockchainTxRequest;
import dapp.ma.bcback.dto.KycStatusResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "user-service", url = "${user-service.url:http://localhost:8081}", configuration = UserClientConfig.class)
public interface UserClient {
    @GetMapping("/internal/users/{wallet}/exists")
    Boolean existsByWallet(@PathVariable String wallet);

    @GetMapping("/internal/users/{wallet}/kyc-status")
    KycStatusResponse getKycStatus(@PathVariable String wallet);

    @PutMapping("/internal/users/{wallet}/bc-tx")
    void updateBlockchainTx(@PathVariable String wallet,
                            @RequestBody BlockchainTxRequest dto);
}