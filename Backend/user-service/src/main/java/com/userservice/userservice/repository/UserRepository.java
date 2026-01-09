package com.userservice.userservice.repository;

import com.userservice.userservice.entity.User;
import com.userservice.userservice.enu.RoleName;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByEmail(String email);

    Optional<User> findByPhone(String phone);

    Boolean existsByEmail(String email);

    boolean existsByEthereumAddress(String ethereumAddress);

    Optional<User> findByEthereumAddress(String ethereumAddress);

    Page<User> findByEmailContainingOrFirstNameContainingOrLastNameContaining(
            String email, String firstName, String lastName, Pageable pageable);

    // ✅ Nouvelles méthodes pour la vérification email
    Optional<User> findByEmailVerificationToken(String token);

    List<User> findByEmailTokenExpiryBefore(LocalDateTime dateTime);

    // ✅ Recherche par rôle
    Page<User> findByRole(RoleName role, Pageable pageable);

    List<User> findByRole(RoleName role);

    // ✅ Recherche par ville/pays
    Page<User> findByCity(String city, Pageable pageable);

    Page<User> findByCountry(String country, Pageable pageable);

    Page<User> findByCityAndCountry(String city, String country, Pageable pageable);

    @Modifying
    @Query("UPDATE User u SET u.enabled = :enabled WHERE u.id = :userId")
    void updateEnabledStatus(@Param("userId") Long userId, @Param("enabled") boolean enabled);

    // ✅ Mettre à jour le statut de vérification email
    @Modifying
    @Query("UPDATE User u SET u.emailVerified = true, u.emailVerificationToken = null, u.emailTokenExpiry = null WHERE u.id = :userId")
    void verifyEmail(@Param("userId") Long userId);

    // ✅ Nettoyer les tokens expirés
    @Modifying
    @Query("UPDATE User u SET u.emailVerificationToken = null, u.emailTokenExpiry = null WHERE u.emailTokenExpiry < :now")
    void cleanupExpiredEmailTokens(@Param("now") LocalDateTime now);
}
