package com.example.notificationservice.client;

import com.example.notificationservice.dto.UserProfileDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service", url = "${user-service.url:http://localhost:8080}")
public interface UserClient {
    
    @GetMapping("/internal/users/{id}")
    UserProfileDTO getUserById(@PathVariable("id") Long id);

    @GetMapping("/internal/users/wallet/{walletAddress}")
    UserProfileDTO getUserByWallet(@PathVariable("walletAddress") String walletAddress);
}
