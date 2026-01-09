package com.userservice.userservice.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@Slf4j
public class LocalFileStorageService implements FileStorageService {

    private final Path fileStorageLocation;
    private final String gatewayUrl;

    public LocalFileStorageService(
            @Value("${file.upload-dir:uploads}") String uploadDir,
            @Value("${app.gateway.url:http://localhost:8080}") String gatewayUrl) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.gatewayUrl = gatewayUrl;

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @Override
    public String storeFile(MultipartFile file, String subDirectory) {
        // Nettoyer le nom du fichier
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = "";
        
        try {
            if (originalFileName.contains("..")) {
                throw new RuntimeException("Sorry! Filename contains invalid path sequence " + originalFileName);
            }

            if (originalFileName.lastIndexOf(".") != -1) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }

            // Générer un nom unique
            String fileName = UUID.randomUUID().toString() + fileExtension;

            // Créer le sous-répertoire s'il n'existe pas
            Path targetLocation = this.fileStorageLocation;
            if (subDirectory != null && !subDirectory.isEmpty()) {
                targetLocation = targetLocation.resolve(subDirectory);
                Files.createDirectories(targetLocation);
            }
            
            targetLocation = targetLocation.resolve(fileName);
            
            // Copier le fichier
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Retourner l'URL (pour le MVP, on simule une URL accessible)
            String path = (subDirectory != null && !subDirectory.isEmpty()) 
                    ? "/files/" + subDirectory + "/" + fileName 
                    : "/files/" + fileName;
            
            return gatewayUrl + path;
            
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + originalFileName + ". Please try again!", ex);
        }
    }
}
