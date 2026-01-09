package com.userservice.userservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class WalletSignatureException extends RuntimeException {
    public WalletSignatureException(String message) {
        super(message);
    }
}
