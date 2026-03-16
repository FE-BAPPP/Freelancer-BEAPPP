package com.UsdtWallet.UsdtWallet.model.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Update User Profile Request DTO (FR-02)
 * 
 * Cho phép user update các field profile
 * - fullName, phone, avatar, description, email (optional)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileRequest {
    public String fullName;
    public String phone;
    public String avatar;
    public String description;
    public String email;
}
