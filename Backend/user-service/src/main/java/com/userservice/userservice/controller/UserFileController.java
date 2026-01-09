package com.userservice.userservice.controller;

import com.userservice.userservice.service.FileStorageService;
import com.userservice.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
@Slf4j
public class UserFileController {

    private final FileStorageService fileStorageService;
    private final UserService userService;

    @PostMapping("/photo")
    public ResponseEntity<Map<String, String>> uploadPhoto(
            @RequestHeader("X-Auth-User-Id") Long userId,
            @RequestParam("file") MultipartFile file) {
        
        log.info("User {} uploading profile photo", userId);
        
        // 1. Stocker le fichier
        String fileUrl = fileStorageService.storeFile(file, "avatar");
        
        // 2. Mettre à jour l'utilisateur
        userService.updateFileUrl(userId, fileUrl, "photo");
        
        return ResponseEntity.ok(Map.of(
                "url", fileUrl,
                "type", "photo",
                "status", "saved"
        ));
    }

    @PostMapping("/kyc-recto")
    public ResponseEntity<Map<String, String>> uploadKycRecto(
            @RequestHeader("X-Auth-User-Id") Long userId,
            @RequestParam("file") MultipartFile file) {
        
        log.info("User {} uploading KYC recto", userId);
        
        // 1. Stocker le fichier dans un dossier spécifique
        String fileUrl = fileStorageService.storeFile(file, "kyc_recto");
        
        // 2. Mettre à jour l'utilisateur
        userService.updateFileUrl(userId, fileUrl, "kyc_recto");
        
        return ResponseEntity.ok(Map.of(
                "url", fileUrl,
                "type", "kyc_recto",
                "status", "saved"
        ));
    }

    @PostMapping("/kyc-verso")
    public ResponseEntity<Map<String, String>> uploadKycVerso(
            @RequestHeader("X-Auth-User-Id") Long userId,
            @RequestParam("file") MultipartFile file) {
        
        log.info("User {} uploading KYC verso", userId);
        
        // 1. Stocker le fichier dans un dossier spécifique
        String fileUrl = fileStorageService.storeFile(file, "kyc_verso");
        
        // 2. Mettre à jour l'utilisateur
        userService.updateFileUrl(userId, fileUrl, "kyc_verso");
        
        return ResponseEntity.ok(Map.of(
                "url", fileUrl,
                "type", "kyc_verso",
                "status", "saved"
        ));
    }
}
