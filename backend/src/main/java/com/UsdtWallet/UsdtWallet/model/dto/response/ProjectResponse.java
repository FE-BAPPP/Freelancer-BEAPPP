package com.UsdtWallet.UsdtWallet.model.dto.response;

import com.UsdtWallet.UsdtWallet.model.entity.Project;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Project Response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponse {
    
    private UUID id;
    private UUID jobId;
    private String jobTitle;
    private UUID employerId;
    private String employerName;
    private String employerAvatar;
    private UUID freelancerId;
    private String freelancerName;
    private String freelancerAvatar;
    private UUID awardedProposalId;
    private BigDecimal agreedAmount;
    private String status;
    
    // Progress tracking
    private long totalMilestones;
    private long completedMilestones;
    private int completionPercentage;
    
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static ProjectResponse fromEntity(Project project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .jobId(project.getJobId())
                .jobTitle(project.getJob() != null ? project.getJob().getTitle() : null)
                .employerId(project.getEmployerId())
                .freelancerId(project.getFreelancerId())
                .awardedProposalId(project.getAwardedProposalId())
                .agreedAmount(project.getAgreedAmount())
                .status(project.getStatus().name())
                .startedAt(project.getStartedAt())
                .completedAt(project.getCompletedAt())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }
}
