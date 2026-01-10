package com.example.bookingservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class IncompleteProfileException extends RuntimeException {
    public IncompleteProfileException(String message) {
        super(message);
    }
}
