package com.example.bookingservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
public class ServiceIntegrationException extends RuntimeException {
    public ServiceIntegrationException(String message) {
        super(message);
    }
}
