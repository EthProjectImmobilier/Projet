package dapp.ma.bcback.controller;


import dapp.ma.bcback.service.BlockchainUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@RequestMapping("/bc")
@RequiredArgsConstructor
public class BlockchainController {

    private final BlockchainUserService service;

    public record RegisterOnChainRequest(String wallet, boolean isOwner) {}
    public record BlockchainTxResponse(String txHash, String status) {}

    @PostMapping("/users/register")
    public ResponseEntity<BlockchainTxResponse> register(@RequestBody RegisterOnChainRequest req) {
        String tx = service.registerUserOnChain(req.wallet(), req.isOwner());
        return ResponseEntity.ok(new BlockchainTxResponse(tx, "MINED"));
    }
}
