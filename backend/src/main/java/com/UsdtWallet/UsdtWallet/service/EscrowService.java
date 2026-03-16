package com.UsdtWallet.UsdtWallet.service;

import com.UsdtWallet.UsdtWallet.model.dto.response.EscrowResponse;
import com.UsdtWallet.UsdtWallet.model.entity.*;
import com.UsdtWallet.UsdtWallet.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
public class EscrowService {

    private final EscrowRepository escrowRepository;
    private final MilestoneRepository milestoneRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final PointsService pointsService;
    private final NotificationService notificationService;

    
    @Transactional
    public void lockProjectEscrow(UUID projectId, UUID employerId, BigDecimal amount) {
        pointsService.lockProjectFunds(employerId, amount, projectId.toString());
        log.info("Project Fund Pool locked: projectId={}, amount={}", projectId, amount);
    }

    
    public BigDecimal getRemainingProjectEscrow(UUID projectId) {
        BigDecimal totalFunded = pointsService.getProjectFundedAmount(projectId.toString());
        BigDecimal totalAllocated = escrowRepository.findTotalLockedAmountByProject(projectId);
        if (totalAllocated == null) totalAllocated = BigDecimal.ZERO;
        return totalFunded.subtract(totalAllocated);
    }

    
    @Transactional
    public EscrowResponse allocateFromPool(UUID milestoneId, UUID employerId) {

        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));

        Project project = projectRepository.findById(milestone.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getEmployerId().equals(employerId)) {
            throw new RuntimeException("Only employer can allocate funds");
        }

        if (project.getStatus() == Project.ProjectStatus.CANCELLED || 
            project.getStatus() == Project.ProjectStatus.COMPLETED) {
            throw new RuntimeException("Cannot allocate funds for project in " + project.getStatus() + " status");
        }

        if (escrowRepository.existsByMilestoneId(milestoneId)) {
            throw new RuntimeException("Escrow already exists for this milestone");
        }

        BigDecimal milestoneAmount = milestone.getAmount();

        BigDecimal remainingPool = getRemainingProjectEscrow(project.getId());
        if (remainingPool.compareTo(milestoneAmount) < 0) {
            throw new RuntimeException(
                "Insufficient escrow pool. Available: " + remainingPool + ", Required: " + milestoneAmount
            );
        }

        Escrow escrow = Escrow.builder()
                .projectId(project.getId())
                .milestoneId(milestoneId)
                .employerId(employerId)
                .freelancerId(project.getFreelancerId())
                .amount(milestoneAmount)
                .status(Escrow.EscrowStatus.LOCKED)
                .lockedAt(LocalDateTime.now())
                .build();

        escrow = escrowRepository.save(escrow);
        log.info("Milestone allocation successful: escrowId={}, milestoneId={}, amount={}", 
                escrow.getId(), milestoneId, milestoneAmount);

        notificationService.createNotification(
                project.getFreelancerId(),
                Notification.NotificationType.MILESTONE_CREATED,
                "Giai đoạn mới đã được thiết lập",
                String.format("Kinh phí cho giai đoạn '%s' đã được nạp vào hệ thống để bắt đầu.", milestone.getTitle()),
                "MILESTONE",
                milestoneId
        );

        return mapToResponse(escrow);
    }

    
    @Transactional
    public void updateAllocation(UUID milestoneId, BigDecimal newAmount) {
        Escrow escrow = escrowRepository.findByMilestoneId(milestoneId)
                .orElseThrow(() -> new RuntimeException("Escrow record not found for milestone"));
        
        if (escrow.getStatus() != Escrow.EscrowStatus.LOCKED) {
            throw new RuntimeException("Can only update allocation for LOCKED escrow");
        }

        BigDecimal delta = newAmount.subtract(escrow.getAmount());
        if (delta.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal remainingPool = getRemainingProjectEscrow(escrow.getProjectId());
            if (remainingPool.compareTo(delta) < 0) {
                throw new RuntimeException("Insufficient pool balance for amount increase");
            }
        }

        escrow.setAmount(newAmount);
        escrowRepository.save(escrow);
        log.info("Escrow allocation updated: milestoneId={}, newAmount={}", milestoneId, newAmount);
    }

    
    @Transactional
    public EscrowResponse releaseFromProjectEscrow(UUID projectId, UUID milestoneId, BigDecimal amount) {
        Escrow escrow = escrowRepository.findByMilestoneId(milestoneId)
                .orElseThrow(() -> new RuntimeException("Escrow not found for this milestone"));

        if (escrow.getStatus() != Escrow.EscrowStatus.LOCKED) {
            throw new RuntimeException("Escrow is not in LOCKED state");
        }

        if (!escrow.getProjectId().equals(projectId)) {
            throw new RuntimeException("Project ID mismatch for escrow release");
        }

        pointsService.releaseProjectFunds(
                escrow.getFreelancerId(),
                amount,
                projectId.toString(),
                milestoneId.toString()
        );

        escrow.setStatus(Escrow.EscrowStatus.RELEASED);
        escrow.setReleasedAt(LocalDateTime.now());
        escrow.setReleasedTo(escrow.getFreelancerId());
        escrow = escrowRepository.save(escrow);

        log.info("Milestone funds released: projectId={}, milestoneId={}, amount={}",
                projectId, milestoneId, amount);

        notificationService.createNotification(
                escrow.getFreelancerId(),
                Notification.NotificationType.PAYMENT_RECEIVED,
                "Thanh toán đã được giải ngân",
                String.format("Bạn đã nhận được %.2f USDT cho việc hoàn thành giai đoạn.", amount),
                "MILESTONE",
                milestoneId
        );

        return mapToResponse(escrow);
    }

    
    @Transactional
    public EscrowResponse refundFunds(UUID milestoneId, UUID adminId) {

        Escrow escrow = escrowRepository.findByMilestoneId(milestoneId)
                .orElseThrow(() -> new RuntimeException("Escrow not found for this milestone"));

        if (escrow.getStatus() != Escrow.EscrowStatus.LOCKED && 
            escrow.getStatus() != Escrow.EscrowStatus.DISPUTED) {
            throw new RuntimeException("Cannot refund escrow in current state: " + escrow.getStatus());
        }

        pointsService.refundProjectFunds(
                escrow.getEmployerId(),
                escrow.getAmount(),
                escrow.getProjectId().toString()
        );

        escrow.setStatus(Escrow.EscrowStatus.REFUNDED);
        escrow.setRefundedAt(LocalDateTime.now());
        escrow = escrowRepository.save(escrow);

        log.info("✅ Escrow refunded: {}, amount: {} returned to employer", 
                escrow.getId(), escrow.getAmount());

        notificationService.createNotification(
                escrow.getEmployerId(),
                Notification.NotificationType.PAYMENT_RECEIVED,
                "Đã hoàn trả ký quỹ",
                String.format("%.2f USDT đã được hoàn trả về tài khoản của bạn.", escrow.getAmount()),
                "MILESTONE",
                milestoneId
        );

        notificationService.createNotification(
                escrow.getFreelancerId(),
                Notification.NotificationType.SYSTEM_ALERT,
                "Ký quỹ đã được hoàn trả",
                "Số tiền ký quỹ cho giai đoạn đã được hoàn trả cho khách hàng.",
                "MILESTONE",
                milestoneId
        );

        return mapToResponse(escrow);
    }

    
    @Transactional
    public EscrowResponse markAsDisputed(UUID milestoneId) {
        Escrow escrow = escrowRepository.findByMilestoneId(milestoneId)
                .orElseThrow(() -> new RuntimeException("Escrow not found for this milestone"));

        if (escrow.getStatus() != Escrow.EscrowStatus.LOCKED) {
            throw new RuntimeException("Only LOCKED escrow can be disputed");
        }

        escrow.setStatus(Escrow.EscrowStatus.DISPUTED);
        escrow = escrowRepository.save(escrow);

        log.info("⚠️ Escrow marked as disputed: {}", escrow.getId());

        return mapToResponse(escrow);
    }

    
    public EscrowResponse getEscrowByMilestoneId(UUID milestoneId) {
        Escrow escrow = escrowRepository.findByMilestoneId(milestoneId)
                .orElseThrow(() -> new RuntimeException("Escrow not found for this milestone"));
        return mapToResponse(escrow);
    }

    
    public List<EscrowResponse> getEscrowsByProject(UUID projectId) {
        List<Escrow> escrows = escrowRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
        return escrows.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    
    public BigDecimal getTotalLockedAmount(UUID projectId) {
        return escrowRepository.findTotalLockedAmountByProject(projectId);
    }

    
    public EscrowStatistics getEmployerEscrowStatistics(UUID employerId) {
        List<Escrow> allEscrows = escrowRepository.findByEmployerIdOrderByCreatedAtDesc(employerId);
        
        BigDecimal totalLocked = allEscrows.stream()
                .filter(e -> e.getStatus() == Escrow.EscrowStatus.LOCKED)
                .map(Escrow::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalReleased = allEscrows.stream()
                .filter(e -> e.getStatus() == Escrow.EscrowStatus.RELEASED)
                .map(Escrow::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalRefunded = allEscrows.stream()
                .filter(e -> e.getStatus() == Escrow.EscrowStatus.REFUNDED)
                .map(Escrow::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalDisputed = allEscrows.stream()
                .filter(e -> e.getStatus() == Escrow.EscrowStatus.DISPUTED)
                .count();

        return EscrowStatistics.builder()
                .userId(employerId)
                .totalLocked(totalLocked)
                .totalReleased(totalReleased)
                .totalRefunded(totalRefunded)
                .totalDisputed(totalDisputed)
                .build();
    }

    
    private EscrowResponse mapToResponse(Escrow escrow) {
        Milestone milestone = escrow.getMilestoneId() != null ?
                milestoneRepository.findById(escrow.getMilestoneId()).orElse(null) : null;

        return EscrowResponse.builder()
                .id(escrow.getId())
                .projectId(escrow.getProjectId())
                .milestoneId(escrow.getMilestoneId())
                .milestoneTitle(milestone != null ? milestone.getTitle() : null)
                .employerId(escrow.getEmployerId())
                .freelancerId(escrow.getFreelancerId())
                .amount(escrow.getAmount())
                .status(escrow.getStatus().name())
                .lockedAt(escrow.getLockedAt())
                .releasedAt(escrow.getReleasedAt())
                .refundedAt(escrow.getRefundedAt())
                .releasedTo(escrow.getReleasedTo())
                .createdAt(escrow.getCreatedAt())
                .updatedAt(escrow.getUpdatedAt())
                .build();
    }

    
    @lombok.Data
    @lombok.Builder
    public static class EscrowStatistics {
        private UUID userId;
        private BigDecimal totalLocked;
        private BigDecimal totalReleased;
        private BigDecimal totalRefunded;
        private long totalDisputed;
    }
}
