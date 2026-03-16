package com.UsdtWallet.UsdtWallet.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * User Entity - Quản lý tài khoản người dùng (FR-01)
 * 
 * Roles:
 * - FREELANCER: Người nhận việc
 * - EMPLOYER: Người đăng việc
 * - ADMIN: Quản trị hệ thống
 */
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_users_email", columnList = "email"),
    @Index(name = "idx_users_username", columnList = "username")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "full_name", length = 100)
    private String fullName;

    @Column(length = 255)
    private String avatar;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.FREELANCER;

    @Column(length = 20)
    private String phone;

    // Location info (FR-01)
    @Column(length = 50)
    private String country;
    
    @Column(length = 50)
    private String city;

    // Timezone (FR-01)
    @Column(length = 50)
    @Builder.Default
    private String timezone = "UTC";

    // Account status
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    // Timestamps
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Security timestamps (FR-01)
    @Column(name = "password_changed_at")
    private LocalDateTime passwordChangedAt;
    
    @Column(name = "withdrawals_disabled_until")
    private LocalDateTime withdrawalsDisabledUntil;

    // 2FA - Two Factor Authentication (FR-01)
    @Column(name = "two_factor_enabled")
    @Builder.Default
    private Boolean twoFactorEnabled = false;

    @Column(name = "two_factor_secret")
    private String twoFactorSecret;

    @Column(name = "two_factor_temp_secret")
    private String twoFactorTempSecret;

    @Column(name = "two_factor_enabled_at")
    private LocalDateTime twoFactorEnabledAt;

    // Email verification (FR-01)
    @Column(name = "email_verified")
    @Builder.Default
    private Boolean emailVerified = false;

    @Column(name = "email_verification_token")
    private String emailVerificationToken;

    @Column(name = "email_verification_token_expires_at")
    private LocalDateTime emailVerificationTokenExpiresAt;

    @PrePersist
    @PreUpdate
    private void ensureDefaults() {
        if (twoFactorEnabled == null) twoFactorEnabled = false;
        if (emailVerified == null) emailVerified = false;
        if (timezone == null) timezone = "UTC";
        if (isActive == null) isActive = true;
    }

    // Helper methods
    public boolean isActive() {
        return Boolean.TRUE.equals(this.isActive);
    }

    public boolean isEmailVerified() {
        return Boolean.TRUE.equals(this.emailVerified);
    }

    public boolean isTwoFactorEnabled() {
        return Boolean.TRUE.equals(this.twoFactorEnabled);
    }
    
    public boolean isAdmin() {
        return Role.ADMIN.equals(this.role);
    }
    
    public boolean isFreelancer() {
        return Role.FREELANCER.equals(this.role);
    }
    
    public boolean isEmployer() {
        return Role.EMPLOYER.equals(this.role);
    }

    public enum Role {
        FREELANCER,  // Người nhận việc
        EMPLOYER,    // Người đăng việc  
        ADMIN        // Quản trị viên
    }
}
