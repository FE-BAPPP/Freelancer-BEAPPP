package com.UsdtWallet.UsdtWallet.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Escrow Response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EscrowResponse {

    private UUID id;
    private UUID projectId;
    private UUID milestoneId;
    private String milestoneTitle;
    private UUID employerId;
    private UUID freelancerId;
    
    // Số tiền ký quỹ (Points)
    // Chỉ dùng Points, không có phí platform trong escrow
    private BigDecimal amount;
    
    private String status; // LOCKED, RELEASED, REFUNDED, DISPUTED
    
    private LocalDateTime lockedAt;
    private LocalDateTime releasedAt;
    private LocalDateTime refundedAt;
    private UUID releasedTo;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
