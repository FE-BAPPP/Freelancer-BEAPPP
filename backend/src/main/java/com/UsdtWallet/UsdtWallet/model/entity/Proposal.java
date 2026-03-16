package com.UsdtWallet.UsdtWallet.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Proposal Entity - Đề xuất từ Freelancer cho Job (FR-05)
 * 
 * Freelancer gửi Proposal cho Job, Employer review để award hoặc reject
 */
@Entity
@Table(name = "proposals", indexes = {
    @Index(name = "idx_proposals_job_id", columnList = "job_id"),
    @Index(name = "idx_proposals_freelancer_id", columnList = "freelancer_id"),
    @Index(name = "idx_proposals_status", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Proposal {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "job_id", nullable = false)
    private UUID jobId;

    @Column(name = "freelancer_id", nullable = false)
    private UUID freelancerId;

    // Thư ứng tuyển
    @Column(name = "cover_letter", nullable = false, columnDefinition = "TEXT")
    private String coverLetter;

    // Số tiền đề xuất (Points)
    @Column(name = "proposed_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal proposedAmount;

    // Thời gian dự kiến (ngày)
    @Column(name = "estimated_duration_days")
    private Integer estimatedDurationDays;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ProposalStatus status = ProposalStatus.PENDING;

    @Column(name = "awarded_at")
    private LocalDateTime awardedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum ProposalStatus {
        PENDING,        // Chờ xét duyệt
        SHORTLISTED,    // Được shortlist
        AWARDED,        // Được trao dự án → tạo Project
        REJECTED,       // Bị từ chối
        WITHDRAWN       // Freelancer rút lại
    }
}