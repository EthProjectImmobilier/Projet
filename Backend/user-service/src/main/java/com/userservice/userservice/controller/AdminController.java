package com.userservice.userservice.controller;

import com.userservice.userservice.dto.CreateUserRequest;
import com.userservice.userservice.dto.UpdateProfileRequest;
import com.userservice.userservice.dto.UserResponse;
import com.userservice.userservice.enu.RoleName;
import com.userservice.userservice.service.AdminService;
import com.userservice.userservice.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final AuthService authService; // Ajouté pour la méthode forceLogoutUser

    @GetMapping("/users")
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) RoleName role,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String country
    ) {
        Pageable pageable = PageRequest.of(page, size);

        if (role != null || city != null || country != null) {
            return ResponseEntity.ok(adminService.searchUsersAdvanced(role, city, country, pageable));
        }

        return ResponseEntity.ok(adminService.getAllUsers(pageable));
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody @Valid CreateUserRequest request) {
        adminService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body("Utilisateur créé avec succès");
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getUserById(id));
    }

    @PutMapping("/users/{id}/enable")
    public ResponseEntity<?> enableUser(@PathVariable Long id) {
        adminService.enableUser(id);
        return ResponseEntity.ok("Utilisateur activé avec succès");
    }

    @PutMapping("/users/{id}/disable")
    public ResponseEntity<?> disableUser(@PathVariable Long id) {
        adminService.disableUser(id);
        return ResponseEntity.ok("Utilisateur désactivé avec succès");
    }

    @GetMapping("/users/search")
    public ResponseEntity<Page<UserResponse>> searchUsers(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(adminService.searchUsers(query, pageable));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok("Utilisateur supprimé avec succès");
    }

    @PostMapping("/users/{id}/force-logout")
    public ResponseEntity<?> forceLogoutUser(@PathVariable Long id) {
        authService.forceLogoutUser(id);
        return ResponseEntity.ok("Utilisateur déconnecté avec succès par l'admin");
    }

    @PutMapping("/users/{id}/profile")
    public ResponseEntity<UserResponse> updateUserProfile(
            @PathVariable Long id,
            @RequestBody @Valid UpdateProfileRequest request) {
        UserResponse updatedUser = adminService.updateUserProfile(id, request);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long id,
            @RequestParam RoleName newRole) {
        adminService.updateUserRole(id, newRole);
        return ResponseEntity.ok("Rôle mis à jour avec succès");
    }
}