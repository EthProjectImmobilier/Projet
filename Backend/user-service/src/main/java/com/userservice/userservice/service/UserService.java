package com.userservice.userservice.service;

import com.userservice.userservice.dto.UpdateProfileRequest;
import com.userservice.userservice.dto.UserResponse;
import com.userservice.userservice.entity.User;
import com.userservice.userservice.exception.UserNotFoundException;
import com.userservice.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Transactional
    public User save(User user) {
        return userRepository.save(user);
    }

    @Transactional
    public void updateLastLogin(Long userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setLastLogin(java.time.LocalDateTime.now());
            userRepository.save(user);
        });
    }

    @Transactional
    public String updateFileUrl(Long userId, String fileUrl, String type) {
        User user = findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        switch (type.toLowerCase()) {
            case "avatar":
            case "photo":
                user.setPhotoUrl(fileUrl);
                break;
            case "kyc_recto":
            case "kycrecto":
                user.setKycRectoUrl(fileUrl);
                break;
            case "kyc_verso":
            case "kycverso":
                user.setKycVersoUrl(fileUrl);
                break;
            default:
                // Si c'est un autre type, on peut décider de ne rien faire ou de lever une exception
                log.warn("Unknown file type for DB storage: {}", type);
                break;
        }

        userRepository.save(user);
        return fileUrl;
    }

    public Optional<User> findByEthereumAddress(String ethereumAddress) {
        return userRepository.findByEthereumAddress(ethereumAddress);
    }

    public UserResponse getCurrentUserDto(Long userId) {
        return findById(userId)
                .map(this::mapToResponse)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    public UserResponse getUserByWalletDto(String walletAddress) {
        return findByEthereumAddress(walletAddress)
                .map(this::mapToResponse)
                .orElseThrow(() -> new UserNotFoundException("User with wallet " + walletAddress + " not found"));
    }

    private UserResponse mapToResponse(User u) {
        return UserResponse.builder()
                .id(u.getId())
                .email(u.getEmail())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .enabled(u.isEnabled())
                .emailVerified(u.isEmailVerified())
                .walletVerified(u.isWalletVerified())
                .role(u.getRole())
                .description(u.getDescription())
                .dateNaissance(u.getDateNaissance())
                .country(u.getCountry())
                .city(u.getCity())
                .phone(u.getPhone())
                .walletAddress(u.getEthereumAddress())
                .photoUrl(u.getPhotoUrl())
                .kycRectoUrl(u.getKycRectoUrl())
                .kycVersoUrl(u.getKycVersoUrl())
                .createdAt(u.getCreatedAt())
                .lastLogin(u.getLastLogin())
                .build();
    }

    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // Vérifier si le téléphone est déjà utilisé
        if (request.phone() != null && !request.phone().isBlank()) {
            Optional<User> existingUser = userRepository.findByPhone(request.phone());
            if (existingUser.isPresent() && !existingUser.get().getId().equals(userId)) {
                throw new com.userservice.userservice.exception.InvalidActionException("Ce numéro de téléphone est déjà utilisé");
            }
        }

        if (request.firstName() != null && !request.firstName().isBlank()) {
            user.setFirstName(request.firstName());
        }
        if (request.lastName() != null && !request.lastName().isBlank()) {
            user.setLastName(request.lastName());
        }
        if (request.phone() != null && !request.phone().isBlank()) {
            user.setPhone(request.phone());
        }
        if (request.description() != null) {
            user.setDescription(request.description());
        }
        if (request.dateNaissance() != null) {
            user.setDateNaissance(request.dateNaissance());
        }
        if (request.country() != null && !request.country().isBlank()) {
            user.setCountry(request.country());
        }
        if (request.city() != null && !request.city().isBlank()) {
            user.setCity(request.city());
        }

        User saved = userRepository.save(user);
        return mapToUserResponse(saved);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .enabled(user.isEnabled())
                .emailVerified(user.isEmailVerified())
                .walletVerified(user.isWalletVerified())
                .role(user.getRole())
                .description(user.getDescription())
                .dateNaissance(user.getDateNaissance())
                .country(user.getCountry())
                .city(user.getCity())
                .phone(user.getPhone())
                .walletAddress(user.getEthereumAddress())
                .photoUrl(user.getPhotoUrl())
                .kycRectoUrl(user.getKycRectoUrl())
                .kycVersoUrl(user.getKycVersoUrl())
                .createdAt(user.getCreatedAt())
                .lastLogin(user.getLastLogin())
                .build();
    }
}
