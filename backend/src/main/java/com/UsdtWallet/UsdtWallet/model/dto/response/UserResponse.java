package com.UsdtWallet.UsdtWallet.model.dto.response;

import com.UsdtWallet.UsdtWallet.model.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * User Response DTO - Clean response for API
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private UUID id;
    private String username;
    private String fullName;
    private User.Role role;
    private String avatar;
    private String email;
    private String phone;
    private String country;
    private String city;
    private String timezone;
    private Boolean isActive;
    private Boolean emailVerified;
    private Boolean twoFactorEnabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .country(user.getCountry())
                .city(user.getCity())
                .timezone(user.getTimezone())
                .role(user.getRole())
                .avatar(user.getAvatar())
                .isActive(user.getIsActive())
                .emailVerified(user.getEmailVerified())
                .twoFactorEnabled(user.getTwoFactorEnabled())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
