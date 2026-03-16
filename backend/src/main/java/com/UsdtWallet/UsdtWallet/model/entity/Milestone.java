package com.UsdtWallet.UsdtWallet.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Milestone Entity - Các giai đoạn của Project
 * Workflow tuần tự: PENDING → IN_PROGRESS → SUBMITTED → APPROVED → RELEASED
 */
@Entity
@Table(name = "milestones", indexes = {
    @Index(name = "idx_milestones_project_id", columnList = "project_id"),
    @Index(name = "idx_milestones_status", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Milestone {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Số tiền milestone (Points)
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    // Thứ tự milestone trong project
    @Column(name = "sequence_order", nullable = false)
    @Builder.Default
    private Integer sequenceOrder = 1;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private MilestoneStatus status = MilestoneStatus.PENDING;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    // Timestamps cho các trạng thái
    @Column(name = "funded_at")
    private LocalDateTime fundedAt;
    
    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "released_at")
    private LocalDateTime releasedAt;
    
    // Freelancer submit deliverables
    @Column(name = "deliverables", columnDefinition = "TEXT")
    private String deliverables;
    
    // Ghi chú hoàn thành từ Freelancer
    @Column(name = "completion_notes", columnDefinition = "TEXT")
    private String completionNotes;
    
    // Lý do từ chối từ Employer
    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum MilestoneStatus {
        PENDING,        // Chưa được fund
        IN_PROGRESS,    // Đã fund, đang thực hiện
        SUBMITTED,      // Freelancer đã submit work
        APPROVED,       // Employer đã approve
        REJECTED,       // Employer từ chối, cần sửa
        RELEASED        // Đã giải ngân cho Freelancer
    }
}