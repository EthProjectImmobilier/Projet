package com.userservice.userservice.controller;

import com.userservice.userservice.dto.UpdateProfileRequest;
import com.userservice.userservice.dto.UserFullResponse;
import com.userservice.userservice.dto.UserResponse;
import com.userservice.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // Récupère l'utilisateur connecté via header X-Auth-User-Id
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(
            @RequestHeader("X-Auth-User-Id") String userIdHeader) {

        Long userId = Long.valueOf(userIdHeader);
        UserResponse response = userService.getCurrentUserDto(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me/full")
    public ResponseEntity<UserFullResponse> getMyFullInfo(
            @RequestHeader("X-Auth-User-Id") String userIdHeader) {

        Long userId = Long.valueOf(userIdHeader);
        UserFullResponse response = userService.getUserFullResponse(userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateCurrentUser(
            @RequestHeader("X-Auth-User-Id") String userIdHeader,
            @Valid @RequestBody UpdateProfileRequest req) {

        Long userId = Long.valueOf(userIdHeader);
        UserResponse response = userService.updateProfile(userId, req);
        return ResponseEntity.ok(response);
    }

    // ✅ NOUVELLE ENDPOINT : Obtenir les infos d'un utilisateur par ID (pour admin ou autres services)
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long userId) {
        UserResponse response = userService.getCurrentUserDto(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{userId}/full")
    public ResponseEntity<UserFullResponse> getUserFullById(@PathVariable Long userId) {
        UserFullResponse response = userService.getUserFullResponse(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/batch")
    public ResponseEntity<List<UserResponse>> getUsersByIds(@RequestBody List<Long> userIds) {
        return ResponseEntity.ok(userService.getUsersByIds(userIds));
    }
}


