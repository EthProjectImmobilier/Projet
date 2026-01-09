package com.userservice.userservice.controller;

import com.userservice.userservice.dto.UserResponse;
import com.userservice.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/users")
@RequiredArgsConstructor
public class InternalUserController {

    private final UserService userService;

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long userId) {
        UserResponse response = userService.getCurrentUserDto(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/wallet/{walletAddress}")
    public ResponseEntity<UserResponse> getUserByWallet(@PathVariable String walletAddress) {
        UserResponse response = userService.getUserByWalletDto(walletAddress);
        return ResponseEntity.ok(response);
    }
}
