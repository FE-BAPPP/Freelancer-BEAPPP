package com.UsdtWallet.UsdtWallet.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * FreelancerProfile Entity - Hồ sơ Freelancer (FR-02)
 * 
 * Chứa thông tin nghề nghiệp, skills, portfolio, và thống kê
 */
@Entity
@Table(name = "freelancer_profiles", indexes = {
    @Index(name = "idx_freelancer_profiles_user_id", columnList = "user_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class FreelancerProfile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    // Tiêu đề nghề nghiệp
    @Column(name = "professional_title", length = 255)
    private String professionalTitle;
    
    // Giới thiệu bản thân
    @Column(columnDefinition = "TEXT")
    private String bio;

    // Giá theo giờ (USDT)
    @Column(name = "hourly_rate", precision = 15, scale = 2)
    private BigDecimal hourlyRate;

    // Trạng thái sẵn sàng nhận việc
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private Availability availability = Availability.AVAILABLE;

    // Thống kê
    @Column(name = "total_earnings", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalEarnings = BigDecimal.ZERO;

    @Column(name = "jobs_completed")
    @Builder.Default
    private Integer jobsCompleted = 0;

    @Column(name = "avg_rating", precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal avgRating = BigDecimal.ZERO;
    
    @Column(name = "review_count")
    @Builder.Default
    private Integer reviewCount = 0;

    // Portfolio links
    @Column(name = "portfolio_url", length = 500)
    private String portfolioUrl;
    
    @Column(name = "github_url", length = 255)
    private String githubUrl;
    
    @Column(name = "linkedin_url", length = 255)
    private String linkedinUrl;

    // Skills as array (PostgreSQL text array)
    @Column(name = "skills", columnDefinition = "text[]")
    @Builder.Default
    private List<String> skills = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum Availability {
        AVAILABLE,      // Sẵn sàng nhận việc
        BUSY,           // Đang bận
        NOT_AVAILABLE   // Không nhận việc
    }
}