package com.UsdtWallet.UsdtWallet.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MilestoneResponse {
    private UUID id;
    private UUID projectId;
    private String title;
    private String description;
    private BigDecimal amount;
    private Integer sequenceOrder;
    private String status;
    private LocalDateTime dueDate;
    private LocalDateTime fundedAt;
    private LocalDateTime submittedAt;
    private LocalDateTime approvedAt;
    private LocalDateTime releasedAt;
    private String deliverables;
    private String completionNotes;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
