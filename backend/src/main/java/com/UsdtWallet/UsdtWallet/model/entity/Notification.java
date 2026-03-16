package com.UsdtWallet.UsdtWallet.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Notification Entity - Hệ thống thông báo (FR-12)
 * 
 * Gửi thông báo cho các sự kiện quan trọng:
 * - Deposit/Withdrawal
 * - Milestone events
 * - Project events
 * - Messages
 */
@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notifications_user_id", columnList = "user_id"),
    @Index(name = "idx_notifications_is_read", columnList = "is_read")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50, columnDefinition = "varchar(50)")
    private NotificationType type;
    
    @Column(nullable = false, length = 255)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String message;
    
    // Liên kết đến entity liên quan
    @Column(name = "entity_type", length = 50)
    private String entityType;
    
    @Column(name = "entity_id")
    private UUID entityId;
    
    @Column(name = "is_read")
    @Builder.Default
    private Boolean isRead = false;
    
    @Column(name = "read_at")
    private LocalDateTime readAt;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    public enum NotificationType {
        // Payment events
        DEPOSIT_SUCCESS,
        WITHDRAWAL_SUCCESS,
        WITHDRAWAL_PENDING,
        
        // Job events
        JOB_POSTED,
        PROPOSAL_RECEIVED,
        PROPOSAL_ACCEPTED,
        PROPOSAL_REJECTED,
        
        // Project events  
        PROJECT_STARTED,
        
        // Milestone events
        MILESTONE_CREATED,
        MILESTONE_SUBMITTED,
        MILESTONE_APPROVED,
        MILESTONE_REJECTED,
        
        // Payment flow
        PAYMENT_RECEIVED,
        PAYMENT_SENT,
        
        // Dispute events
        DISPUTE_OPENED,
        DISPUTE_RESOLVED,
        
        // Chat
        MESSAGE_RECEIVED,
        
        // System
        SYSTEM_ALERT
    }
}