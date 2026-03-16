package com.UsdtWallet.UsdtWallet.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Escrow Entity - Quản lý tiền ký quỹ
 * Mỗi Escrow gắn với 1 Milestone để phân bổ và giải ngân
 */
@Entity
@Table(name = "escrow", indexes = {
    @Index(name = "idx_escrow_project_id", columnList = "project_id"),
    @Index(name = "idx_escrow_milestone_id", columnList = "milestone_id"),
    @Index(name = "idx_escrow_status", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Escrow {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;
    
    @Column(name = "milestone_id", nullable = false)
    private UUID milestoneId;

    @Column(name = "employer_id", nullable = false)
    private UUID employerId;

    @Column(name = "freelancer_id", nullable = false)
    private UUID freelancerId;

    // Số tiền ký quỹ (Points)
    // Chỉ dùng Points để thanh toán escrow, không cần currency
    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EscrowStatus status = EscrowStatus.LOCKED;

    // Timestamps
    @Column(name = "locked_at")
    private LocalDateTime lockedAt;

    @Column(name = "released_at")
    private LocalDateTime releasedAt;
    
    @Column(name = "released_to")
    private UUID releasedTo;

    @Column(name = "refunded_at")
    private LocalDateTime refundedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum EscrowStatus {
        LOCKED,     // Tiền đang giữ
        RELEASED,   // Đã giải ngân cho Freelancer
        REFUNDED,   // Đã hoàn cho Employer (dispute)
        DISPUTED    // Đang tranh chấp
    }
}