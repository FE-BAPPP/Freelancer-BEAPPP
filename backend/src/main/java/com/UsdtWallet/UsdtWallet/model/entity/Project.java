package com.UsdtWallet.UsdtWallet.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Project Entity - Workspace sau khi Proposal được award (FR-06)
 * 
 * Project được tạo từ Proposal được award
 * Project chứa các milestones và là nơi Employer/Freelancer làm việc
 */
@Entity
@Table(name = "projects", indexes = {
    @Index(name = "idx_projects_employer_id", columnList = "employer_id"),
    @Index(name = "idx_projects_freelancer_id", columnList = "freelancer_id"),
    @Index(name = "idx_projects_status", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "job_id", nullable = false)
    private UUID jobId;
    
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", insertable = false, updatable = false)
    private Job job;

    @Column(name = "employer_id", nullable = false)
    private UUID employerId;

    @Column(name = "freelancer_id", nullable = false)
    private UUID freelancerId;

    @Column(name = "awarded_proposal_id", nullable = false)
    private UUID awardedProposalId;

    // Số tiền thỏa thuận từ proposal
    @Column(name = "agreed_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal agreedAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ProjectStatus status = ProjectStatus.IN_PROGRESS;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum ProjectStatus {
        DRAFT,        // Chưa bắt đầu
        IN_PROGRESS,  // Đang thực hiện
        COMPLETED,    // Hoàn thành
        CANCELLED,    // Bị hủy
        DISPUTED      // Đang tranh chấp
    }
}