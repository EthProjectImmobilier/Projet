package com.example.notificationservice.client;

import com.example.notificationservice.dto.BookingDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "booking-service", url = "${booking-service.url:http://localhost:8080}")
public interface BookingClient {

    @GetMapping("/internal/bookings/{id}")
    BookingDTO getBookingById(@PathVariable("id") Long id);
}
