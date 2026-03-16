package com.UsdtWallet.UsdtWallet.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Job Create Request DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobCreateRequest {
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    @NotNull(message = "Project type is required")
    private String type; // "FIXED_PRICE" or "HOURLY"
    
    // Budget range
    @Positive(message = "Budget min must be positive")
    private BigDecimal budgetMin;
    
    @Positive(message = "Budget max must be positive")
    private BigDecimal budgetMax;
    
    @Builder.Default
    private String currency = "USDT";
    
    private String duration; // e.g., "1-3 months", "Less than 1 month"
    
    private LocalDate deadline;
    
    private List<String> skills; // Required skills (as string names)
    
    private String category; // Job category (e.g., "Web Development", "Mobile", etc.)
}