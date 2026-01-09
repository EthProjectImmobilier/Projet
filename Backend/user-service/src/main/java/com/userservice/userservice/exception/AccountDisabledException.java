// AccountDisabledException.java
package com.userservice.userservice.exception;

public class AccountDisabledException extends RuntimeException {
    public AccountDisabledException(String message) {
        super(message);
    }
}
