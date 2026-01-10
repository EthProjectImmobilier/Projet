package com.example.bookingservice.client;

import com.example.bookingservice.dto.UserProfileDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service", url = "${app.services.user-service-url:http://localhost:8081}")
public interface UserClient {

    @GetMapping("/internal/users/{userId}")
    UserProfileDTO getUserProfile(@PathVariable("userId") Long userId);
}
