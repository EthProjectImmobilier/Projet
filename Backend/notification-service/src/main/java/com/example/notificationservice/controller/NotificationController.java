package com.example.notificationservice.controller;

import com.example.notificationservice.model.Notification;
import com.example.notificationservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    @GetMapping("/me")
    public List<Notification> getMyNotifications(@RequestHeader("X-Auth-User-Id") Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @GetMapping("/me/unread")
    public List<Notification> getMyUnreadNotifications(@RequestHeader("X-Auth-User-Id") Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    @PostMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id, @RequestHeader("X-Auth-User-Id") Long userId) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Notification non trouvée"));
        
        if (!notification.getUserId().equals(userId)) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Accès refusé à cette notification");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @PostMapping("/me/read-all")
    public void markAllMyAsRead(@RequestHeader("X-Auth-User-Id") Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(unread);
    }

    @DeleteMapping("/{id}")
    public void deleteNotification(@PathVariable Long id, @RequestHeader("X-Auth-User-Id") Long userId) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Notification non trouvée"));

        if (!notification.getUserId().equals(userId)) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Accès refusé à cette notification");
        }

        notificationRepository.deleteById(id);
    }

    @DeleteMapping("/me")
    @Transactional
    public void deleteAllMyNotifications(@RequestHeader("X-Auth-User-Id") Long userId) {
        notificationRepository.deleteByUserId(userId);
    }
}
