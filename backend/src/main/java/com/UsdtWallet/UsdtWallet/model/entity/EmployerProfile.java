package com.UsdtWallet.UsdtWallet.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * EmployerProfile Entity - Hồ sơ Employer (FR-03)
 * 
 * Chứa thông tin công ty/cá nhân và thống kê thuê freelancer
 */
@Entity
@Table(name = "employer_profiles", indexes = {
    @Index(name = "idx_employer_profiles_user_id", columnList = "user_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class EmployerProfile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    // Thông tin công ty (tùy chọn)
    @Column(name = "company_name", length = 255)
    private String companyName;
    
    @Column(name = "company_website", length = 255)
    private String companyWebsite;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "company_size", length = 20)
    private CompanySize companySize;
    
    @Column(name = "industry", length = 100)
    private String industry;

    // Thống kê
    @Column(name = "jobs_posted")
    @Builder.Default
    private Integer jobsPosted = 0;

    @Column(name = "active_projects")
    @Builder.Default
    private Integer activeProjects = 0;

    @Column(name = "total_spent", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalSpent = BigDecimal.ZERO;
    
    // Đánh giá từ Freelancers
    @Column(name = "avg_rating", precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal avgRating = BigDecimal.ZERO;
    
    @Column(name = "review_count")
    @Builder.Default
    private Integer reviewCount = 0;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum CompanySize {
        SOLO,       // Cá nhân
        SMALL,      // 1-10 nhân viên
        MEDIUM,     // 11-50 nhân viên
        LARGE       // 50+ nhân viên
    }
}