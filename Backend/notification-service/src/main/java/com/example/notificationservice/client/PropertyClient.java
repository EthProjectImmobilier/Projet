package com.example.notificationservice.client;


import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "property-service", url = "${property-service.url:http://localhost:8080}")
public interface PropertyClient {
    
    @GetMapping("/internal/properties/{id}")
    com.example.notificationservice.dto.PropertyDTO getPropertyById(@PathVariable("id") Long id);
}
