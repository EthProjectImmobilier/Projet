package dapp.ma.bcback.dto;

import java.time.Instant;

public record BlockchainTxRequest(String txHash, Instant registeredAt) {}
