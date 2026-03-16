package com.UsdtWallet.UsdtWallet.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Job Entity - Quản lý công việc đăng tuyển (FR-04)
 * 
 * Employer đăng Job, Freelancers gửi Proposals để được thuê
 */
@Entity
@Table(name = "jobs", indexes = {
    @Index(name = "idx_jobs_employer_id", columnList = "employer_id"),
    @Index(name = "idx_jobs_status", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Job {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(name = "employer_id", nullable = false)
    private UUID employerId;
    
    @Column(nullable = false, length = 255)
    private String title;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;
    
    // Project type: Fixed price or Hourly
    @Enumerated(EnumType.STRING)
    @Column(name = "project_type", nullable = false)
    @Builder.Default
    private ProjectType projectType = ProjectType.FIXED_PRICE;
    
    // Budget range
    @Column(name = "budget_min", precision = 15, scale = 2)
    private BigDecimal budgetMin;
    
    @Column(name = "budget_max", precision = 15, scale = 2)
    private BigDecimal budgetMax;
    
    // Duration estimate
    @Column(name = "duration", length = 100)
    private String duration;

    @Column(name = "deadline")
    private LocalDate deadline;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50, columnDefinition = "varchar(50)")
    @Builder.Default
    private JobStatus status = JobStatus.OPEN;
    
    // Job Category
    @Column(name = "category", length = 100)
    private String category;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Required skills for the job (PostgreSQL text array)
    @Column(name = "skills", columnDefinition = "text[]")
    @Builder.Default
    private List<String> requiredSkills = new ArrayList<>();
    
    public enum JobStatus {
        OPEN,           // Đang nhận proposals
        IN_PROGRESS,    // Đã có project (proposal awarded)
        CLOSED,         // Đóng, không nhận proposal nữa
        CANCELLED       // Bị hủy
    }
    
    public enum ProjectType {
        FIXED_PRICE,    // Giá cố định
        HOURLY          // Theo giờ
    }
}