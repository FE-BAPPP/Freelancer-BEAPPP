package com.UsdtWallet.UsdtWallet.service;

import com.UsdtWallet.UsdtWallet.model.dto.*;
import com.UsdtWallet.UsdtWallet.model.dto.request.*;
import com.UsdtWallet.UsdtWallet.model.entity.*;
import com.UsdtWallet.UsdtWallet.repository.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MilestoneService {
    
    private final MilestoneRepository milestoneRepository;
    private final ProjectRepository projectRepository;
    private final PointsService pointsService;
    private final FreelancerProfileService freelancerProfileService;
    private final EmployerProfileService employerProfileService;
    private final EscrowService escrowService; 
    private final NotificationService notificationService; 
    
    
    public List<Milestone> getProjectMilestones(UUID projectId, UUID userId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found"));
        
        if (!project.getEmployerId().equals(userId) && !project.getFreelancerId().equals(userId)) {
            throw new RuntimeException("Not authorized to view project milestones");
        }
        
        return milestoneRepository.findByProjectIdOrderByCreatedAt(projectId);
    }


    
    public MilestoneStats getProjectMilestoneStats(UUID projectId) {
        List<Milestone> milestones = milestoneRepository.findByProjectIdOrderByCreatedAt(projectId);
        
        BigDecimal totalAmount = milestones.stream()
            .map(Milestone::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal releasedAmount = milestones.stream()
            .filter(m -> m.getStatus() == Milestone.MilestoneStatus.RELEASED)
            .map(Milestone::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        long totalCount = milestones.size();
        long releasedCount = milestones.stream()
            .filter(m -> m.getStatus() == Milestone.MilestoneStatus.RELEASED)
            .count();
        
        return MilestoneStats.builder()
            .totalMilestones(totalCount)
            .releasedMilestones(releasedCount)
            .pendingMilestones(totalCount - releasedCount)
            .totalAmount(totalAmount)
            .releasedAmount(releasedAmount)
            .pendingAmount(totalAmount.subtract(releasedAmount))
            .build();
    }
    
    
    @Data
    @Builder
    @AllArgsConstructor
    public static class MilestoneStats {
        private long totalMilestones;
        private long releasedMilestones;
        private long pendingMilestones;
        private BigDecimal totalAmount;
        private BigDecimal releasedAmount;
        private BigDecimal pendingAmount;
    }
    
    
    @Transactional
    public Milestone createMilestone(UUID employerId, UUID projectId, MilestoneCreateRequest request) {

        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found"));
        
        if (!project.getEmployerId().equals(employerId)) {
            throw new RuntimeException("You are not authorized to create milestones for this project");
        }
        
        if (project.getStatus() != Project.ProjectStatus.IN_PROGRESS) {
            throw new RuntimeException("Can only create milestones for IN_PROGRESS projects");
        }

        int nextOrder = milestoneRepository.findMaxSequenceOrderByProjectId(projectId)
            .orElse(0) + 1;

        BigDecimal totalMilestoneAmount = milestoneRepository
            .sumAmountByProjectId(projectId)
            .orElse(BigDecimal.ZERO)
            .add(request.getAmount());
        
        if (totalMilestoneAmount.compareTo(project.getAgreedAmount()) > 0) {
            throw new RuntimeException("Total milestone amount exceeds project budget");
        }

        BigDecimal remainingPool = escrowService.getRemainingProjectEscrow(projectId);
        if (remainingPool.compareTo(request.getAmount()) < 0) {
            throw new RuntimeException("Insufficient escrow pool. Remaining: " + remainingPool + ", Required: " + request.getAmount());
        }

        Milestone milestone = Milestone.builder()
            .projectId(projectId)
            .title(request.getTitle())
            .description(request.getDescription())
            .amount(request.getAmount())
            .sequenceOrder(nextOrder)
            .status(Milestone.MilestoneStatus.PENDING)
            .dueDate(request.getDueDate())
            .build();
        
        Milestone saved = milestoneRepository.save(milestone);
        log.info("✅ Milestone created: {} for project: {}", saved.getId(), projectId);

        log.info("🔒 Allocating funds from Project Pool for milestone: {}", saved.getId());
        escrowService.allocateFromPool(saved.getId(), employerId);

        notificationService.notifyMilestoneCreated(
            project.getFreelancerId(),
            saved.getId(),
            saved.getTitle(),
            saved.getAmount()
        );
        
        return saved;
    }
    
    
    @Transactional
    public Milestone updateMilestone(UUID employerId, UUID milestoneId, MilestoneUpdateRequest request) {
        
        Milestone milestone = milestoneRepository.findById(milestoneId)
            .orElseThrow(() -> new RuntimeException("Milestone not found"));
        
        Project project = projectRepository.findById(milestone.getProjectId())
            .orElseThrow(() -> new RuntimeException("Project not found"));
        
        if (!project.getEmployerId().equals(employerId)) {
            throw new RuntimeException("Not authorized");
        }

        if (milestone.getStatus() != Milestone.MilestoneStatus.PENDING) {
            throw new RuntimeException("Can only update PENDING milestones");
        }

        if (request.getTitle() != null) {
            milestone.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            milestone.setDescription(request.getDescription());
        }
        if (request.getAmount() != null) {

            escrowService.updateAllocation(milestoneId, request.getAmount());
            milestone.setAmount(request.getAmount());
        }
        if (request.getDueDate() != null) {
            milestone.setDueDate(request.getDueDate());
        }
        
        return milestoneRepository.save(milestone);
    }
    
    
    @Transactional
    public void deleteMilestone(UUID employerId, UUID milestoneId) {
        
        Milestone milestone = milestoneRepository.findById(milestoneId)
            .orElseThrow(() -> new RuntimeException("Milestone not found"));
        
        Project project = projectRepository.findById(milestone.getProjectId())
            .orElseThrow(() -> new RuntimeException("Project not found"));
        
        if (!project.getEmployerId().equals(employerId)) {
            throw new RuntimeException("Not authorized");
        }
        
        if (milestone.getStatus() != Milestone.MilestoneStatus.PENDING) {
            throw new RuntimeException("Can only delete PENDING milestones");
        }
        
        milestoneRepository.delete(milestone);
        log.info("Milestone deleted: milestoneId={}", milestoneId);
    }
    
    
    
    @Transactional
    public Milestone startMilestone(UUID freelancerId, UUID milestoneId) {
        Milestone milestone = milestoneRepository.findById(milestoneId)
            .orElseThrow(() -> new RuntimeException("Milestone not found"));
        
        Project project = projectRepository.findById(milestone.getProjectId())
            .orElseThrow(() -> new RuntimeException("Project not found"));
        
        if (!project.getFreelancerId().equals(freelancerId)) {
            throw new RuntimeException("You are not assigned to this project");
        }
        
        if (milestone.getStatus() != Milestone.MilestoneStatus.PENDING) {
            throw new RuntimeException("Can only start PENDING milestones. Current status: " + milestone.getStatus());
        }

        validateMilestoneSequence(milestone);

        milestone.setStatus(Milestone.MilestoneStatus.IN_PROGRESS);
        Milestone saved = milestoneRepository.save(milestone);
        
        log.info("✅ MILESTONE STARTED: {} (seq: {}) by freelancer: {}", 
            milestoneId, milestone.getSequenceOrder(), freelancerId);

        notificationService.createNotification(
            project.getEmployerId(),
            Notification.NotificationType.SYSTEM_ALERT,
            "Dự án đã bắt đầu triển khai",
            String.format("Freelancer đã bắt đầu thực hiện giai đoạn '%s'", milestone.getTitle()),
            "MILESTONE",
            milestoneId
        );
        
        return saved;
    }
    

    @Transactional
    public Milestone submitMilestoneForReview(UUID freelancerId, UUID milestoneId, 
                                              String deliverables, String notes) {
        
        Milestone milestone = milestoneRepository.findById(milestoneId)
            .orElseThrow(() -> new RuntimeException("Milestone not found"));
        
        Project project = projectRepository.findById(milestone.getProjectId())
            .orElseThrow(() -> new RuntimeException("Project not found"));
        
        if (!project.getFreelancerId().equals(freelancerId)) {
            throw new RuntimeException("Not authorized");
        }

        if (milestone.getStatus() != Milestone.MilestoneStatus.IN_PROGRESS) {
            throw new RuntimeException("Can only submit IN_PROGRESS milestones. Current status: " + milestone.getStatus());
        }

        if (deliverables == null || deliverables.trim().isEmpty()) {
            throw new RuntimeException("Deliverables cannot be empty");
        }

        milestone.setStatus(Milestone.MilestoneStatus.SUBMITTED);
        milestone.setSubmittedAt(LocalDateTime.now());
        milestone.setDeliverables(deliverables);
        milestone.setCompletionNotes(notes);
        
        Milestone saved = milestoneRepository.save(milestone);
        log.info("✅ MILESTONE SUBMITTED: {} (seq: {}) - Waiting employer review", 
            milestoneId, milestone.getSequenceOrder());

        notificationService.notifyMilestoneSubmitted(
            project.getEmployerId(),
            milestoneId,
            milestone.getTitle()
        );
        
        return saved;
    }

    @Transactional
    public Milestone approveMilestone(UUID employerId, UUID milestoneId) {
        
        Milestone milestone = milestoneRepository.findById(milestoneId)
            .orElseThrow(() -> new RuntimeException("Milestone not found"));
        
        Project project = projectRepository.findById(milestone.getProjectId())
            .orElseThrow(() -> new RuntimeException("Project not found"));
        
        if (!project.getEmployerId().equals(employerId)) {
            throw new RuntimeException("Not authorized");
        }

        if (milestone.getStatus() != Milestone.MilestoneStatus.SUBMITTED) {
            throw new RuntimeException("Can only approve SUBMITTED milestones. Current status: " + milestone.getStatus());
        }
        
        log.info("💸 Approving milestone {} - Releasing {} USDT from Project Pool", 
            milestoneId, milestone.getAmount());

        escrowService.releaseFromProjectEscrow(
            project.getId(),
            milestoneId,
            milestone.getAmount()
        );

        milestone.setStatus(Milestone.MilestoneStatus.APPROVED);
        milestone.setApprovedAt(LocalDateTime.now());
        
        Milestone saved = milestoneRepository.save(milestone);
        log.info("✅ MILESTONE APPROVED: {} (seq: {}) - {} USDT released to freelancer", 
            milestoneId, milestone.getSequenceOrder(), milestone.getAmount());

        freelancerProfileService.addToTotalEarnings(project.getFreelancerId(), milestone.getAmount());
        log.debug("💰 Added {} to freelancer {} total_earnings", milestone.getAmount(), project.getFreelancerId());

        notificationService.notifyMilestoneApproved(
            project.getFreelancerId(),
            milestoneId,
            milestone.getTitle(),
            milestone.getAmount()
        );

        checkAndCompleteProject(project.getId());
        
        return saved;
    }
    
    
    @Transactional
    public Milestone rejectMilestone(UUID employerId, UUID milestoneId, String reason) {
        
        Milestone milestone = milestoneRepository.findById(milestoneId)
            .orElseThrow(() -> new RuntimeException("Milestone not found"));
        
        Project project = projectRepository.findById(milestone.getProjectId())
            .orElseThrow(() -> new RuntimeException("Project not found"));
        
        if (!project.getEmployerId().equals(employerId)) {
            throw new RuntimeException("Not authorized");
        }

        if (milestone.getStatus() != Milestone.MilestoneStatus.SUBMITTED) {
            throw new RuntimeException("Can only reject SUBMITTED milestones. Current status: " + milestone.getStatus());
        }

        if (reason == null || reason.trim().isEmpty()) {
            throw new RuntimeException("Rejection reason is required");
        }

        milestone.setStatus(Milestone.MilestoneStatus.IN_PROGRESS);
        milestone.setRejectionReason(reason);
        milestone.setSubmittedAt(null); 
        
        Milestone saved = milestoneRepository.save(milestone);
        log.info("❌ MILESTONE REJECTED: {} (seq: {}) - Reason: {}", 
            milestoneId, milestone.getSequenceOrder(), reason);

        notificationService.notifyMilestoneRejected(
            project.getFreelancerId(),
            milestoneId,
            milestone.getTitle(),
            reason
        );
        
        return saved;
    }


    
    private void validateMilestoneSequence(Milestone currentMilestone) {

        if (currentMilestone.getSequenceOrder() == 1) {
            return;
        }

        List<Milestone> allMilestones = milestoneRepository
            .findByProjectIdOrderBySequenceOrder(currentMilestone.getProjectId());

        for (Milestone m : allMilestones) {
            if (m.getSequenceOrder() < currentMilestone.getSequenceOrder()) {
                if (m.getStatus() != Milestone.MilestoneStatus.APPROVED && 
                    m.getStatus() != Milestone.MilestoneStatus.RELEASED) {
                    throw new RuntimeException(
                        "⚠️ Cannot start milestone " + currentMilestone.getSequenceOrder() + 
                        " - Previous milestone (" + m.getSequenceOrder() + ") must be completed first! " +
                        "Current status: " + m.getStatus()
                    );
                }
            }
        }
        
        log.info("✅ Milestone sequence validated - All previous milestones completed");
    }
    
    
    private void checkAndCompleteProject(UUID projectId) {
        
        List<Milestone> milestones = milestoneRepository.findByProjectIdOrderBySequenceOrder(projectId);
        
        boolean allCompleted = milestones.stream()
            .allMatch(m -> m.getStatus() == Milestone.MilestoneStatus.APPROVED 
                        || m.getStatus() == Milestone.MilestoneStatus.RELEASED);
        
        if (allCompleted) {
            Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
            
            project.setStatus(Project.ProjectStatus.COMPLETED);
            project.setCompletedAt(LocalDateTime.now());
            projectRepository.save(project);

            employerProfileService.decrementActiveProjects(project.getEmployerId());
            employerProfileService.addToTotalSpent(project.getEmployerId(), project.getAgreedAmount());
            log.debug("📉 Decremented active_projects and added {} to total_spent for employer: {}", 
                project.getAgreedAmount(), project.getEmployerId());

            freelancerProfileService.incrementJobsCompleted(project.getFreelancerId());
            log.debug("📈 Incremented jobs_completed for freelancer: {}", project.getFreelancerId());
            
            log.info("✅ Project completed: {}", projectId);

            String msg = String.format("Dự án '%s' đã hoàn thành tất cả các giai đoạn.", project.getJobId()); 
            notificationService.createNotification(
                project.getFreelancerId(),
                Notification.NotificationType.PROJECT_STARTED, 
                "Dự án đã hoàn tất! 🎉",
                "Chúc mừng! Bạn đã hoàn thành xuất sắc dự án.",
                "PROJECT",
                projectId
            );
            notificationService.createNotification(
                project.getEmployerId(),
                Notification.NotificationType.PROJECT_STARTED,
                "Dự án đã hoàn tất! 🎉",
                "Freelancer đã hoàn thành tất cả các mục tiêu đề ra.",
                "PROJECT",
                projectId
            );
        }
    }


}