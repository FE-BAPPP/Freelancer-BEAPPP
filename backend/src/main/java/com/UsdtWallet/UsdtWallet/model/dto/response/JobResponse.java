package com.UsdtWallet.UsdtWallet.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Job Response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobResponse {
    private UUID id;
    private UUID employerId;
    private String employerName;
    private String employerAvatar;
    private String title;
    private String description;
    
    private String type;  // FIXED_PRICE or HOURLY
    
    // Budget range
    private BigDecimal budgetMin;
    private BigDecimal budgetMax;
    
    private String duration;
    private LocalDate deadline;
    private String status;
    private String category;
    
    private List<String> skills;
    private Integer proposalCount;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // User-specific application status
    private Boolean hasApplied;
    private UUID appliedProposalId;
}