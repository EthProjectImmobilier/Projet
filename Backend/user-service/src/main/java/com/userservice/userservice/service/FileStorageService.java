package com.userservice.userservice.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    /**
     * Stocke un fichier et retourne son URL ou son chemin d'accès.
     */
    String storeFile(MultipartFile file, String subDirectory);
}
