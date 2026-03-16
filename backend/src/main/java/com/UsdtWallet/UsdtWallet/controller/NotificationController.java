package com.UsdtWallet.UsdtWallet.controller;

import com.UsdtWallet.UsdtWallet.model.dto.response.ApiResponse;
import com.UsdtWallet.UsdtWallet.model.entity.Notification;
import com.UsdtWallet.UsdtWallet.security.UserPrincipal;
import com.UsdtWallet.UsdtWallet.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('FREELANCER') or hasRole('EMPLOYER') or hasRole('ADMIN')")
public class NotificationController {

    private final NotificationService notificationService;



    // ============= PERSISTENT NOTIFICATION ENDPOINTS =============

    /**
     * Get user notifications with pagination
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Notification>>> getNotifications(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notifications = notificationService.getUserNotifications(
                userPrincipal.getId(), pageable);
        
        return ResponseEntity.ok(ApiResponse.success(
                "Notifications retrieved successfully", notifications));
    }

    /**
     * Get unread notifications count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        Long count = notificationService.getUnreadCount(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(
                "Unread count retrieved", Map.of("count", count)));
    }

    /**
     * Mark notification as read
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable UUID notificationId) {
        
        notificationService.markAsRead(notificationId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
    }

    /**
     * Mark all as read
     */
    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        notificationService.markAllAsRead(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }
}