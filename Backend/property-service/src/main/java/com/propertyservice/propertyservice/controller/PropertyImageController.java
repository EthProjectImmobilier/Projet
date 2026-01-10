package com.propertyservice.propertyservice.controller;

import com.propertyservice.propertyservice.dto.AddImageRequest;
import com.propertyservice.propertyservice.dto.PropertyImageResponse;
import com.propertyservice.propertyservice.dto.ReorderImagesRequest;
import com.propertyservice.propertyservice.service.PropertyImageService;
import com.propertyservice.propertyservice.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/properties/{propertyId}/images")
@RequiredArgsConstructor
public class PropertyImageController {

    private final PropertyImageService propertyImageService;
    private final FileStorageService fileStorageService;

    /**
     * NOUVELLE ROUTE : Upload direct d'une image (fichier + caption en une seule requête)
     */
    @PostMapping("/upload")
    public ResponseEntity<PropertyImageResponse> uploadImage(
            @RequestHeader("X-Auth-User-Id") Long userId,
            @PathVariable Long propertyId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "caption", required = false) String caption) {

        // 1. Stocker le fichier
        String imageUrl = fileStorageService.storeFile(file, "properties");
        
        // 2. Enregistrer en base de données
        PropertyImageResponse response = propertyImageService.addImageToProperty(
                propertyId, imageUrl, caption, userId);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * ANCIENNE ROUTE : Ajouter une image avec URL existante (compatibilité)
     */
    @PostMapping
    public ResponseEntity<PropertyImageResponse> addImage(
            @RequestHeader("X-Auth-User-Id") Long userId,
            @PathVariable Long propertyId,
            @RequestBody AddImageRequest request) {

        PropertyImageResponse response = propertyImageService.addImageToProperty(
                propertyId, request.getImageUrl(), request.getCaption(), userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<PropertyImageResponse>> getPropertyImages(
            @PathVariable Long propertyId) {

        List<PropertyImageResponse> response = propertyImageService.getPropertyImages(propertyId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{imageId}")
    public ResponseEntity<?> deleteImage(
            @RequestHeader("X-Auth-User-Id") Long userId,
            @PathVariable Long propertyId,
            @PathVariable Long imageId) {

        propertyImageService.deletePropertyImage(imageId, propertyId, userId);
        return ResponseEntity.ok("Image deleted successfully");
    }

    @PutMapping("/reorder")
    public ResponseEntity<?> reorderImages(
            @RequestHeader("X-Auth-User-Id") Long userId,
            @PathVariable Long propertyId,
            @RequestBody ReorderImagesRequest request) {

        propertyImageService.reorderImages(propertyId, request.getImageIds(), userId);
        return ResponseEntity.ok("Images reordered successfully");
    }
}
