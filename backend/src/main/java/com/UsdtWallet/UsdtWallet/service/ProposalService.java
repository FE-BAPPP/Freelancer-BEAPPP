package com.UsdtWallet.UsdtWallet.service;

import com.UsdtWallet.UsdtWallet.model.dto.request.ProposalCreateRequest;
import com.UsdtWallet.UsdtWallet.model.dto.response.ProposalResponse;
import com.UsdtWallet.UsdtWallet.model.entity.*;
import com.UsdtWallet.UsdtWallet.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProposalService {

    private final ProposalRepository proposalRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final FreelancerProfileRepository freelancerProfileRepository;
    private final ProjectRepository projectRepository;
    private final EscrowService escrowService; 

    private final MilestoneRepository milestoneRepository; 
    private final ConversationService conversationService; 
    private final NotificationService notificationService;
    private final PointsService pointsService; 
    private final EmployerProfileService employerProfileService; 
    private final FreelancerProfileService freelancerProfileService; 


    
    @Transactional
    public ProposalResponse submitProposal(UUID freelancerId, ProposalCreateRequest request) {
        Job job = jobRepository.findById(request.getJobId())
            .orElseThrow(() -> new RuntimeException("Job not found"));

        if (job.getStatus() != Job.JobStatus.OPEN) {
            throw new RuntimeException("Job is no longer open for proposals");
        }
        if (job.getBudgetMax() != null && request.getProposedAmount().compareTo(job.getBudgetMax()) > 0) {
            throw new RuntimeException(
                "Proposal amount cannot exceed job maximum budget. " +
                "Job budget max: " + job.getBudgetMax() + " "
            );
        }

        boolean alreadySubmitted = proposalRepository.existsByJobIdAndFreelancerId(
            request.getJobId(), freelancerId);
        if (alreadySubmitted) {
            throw new RuntimeException("You have already submitted a proposal for this job");
        }
        User freelancer = userRepository.findById(freelancerId)
            .orElseThrow(() -> new RuntimeException("Freelancer not found"));

        if (freelancer.getRole() != User.Role.FREELANCER) {
            throw new RuntimeException("Only freelancers can submit proposals");
        }

        Proposal proposal = Proposal.builder()
            .jobId(request.getJobId())
            .freelancerId(freelancerId)
            .coverLetter(request.getCoverLetter())
            .proposedAmount(request.getProposedAmount())
            .estimatedDurationDays(request.getEstimatedDurationDays())
            .status(Proposal.ProposalStatus.PENDING)
            .build();

        Proposal savedProposal = proposalRepository.save(proposal);
        log.info("Proposal submitted: proposalId={}, jobId={}, freelancerId={}", 
            savedProposal.getId(), job.getId(), freelancerId);
        notificationService.notifyProposalReceived(
            job.getEmployerId(), 
            job.getId(), 
            freelancer.getFullName(), 
            job.getTitle()
        );


        return mapToProposalResponse(savedProposal, job, freelancer);
    }

    
    public Page<ProposalResponse> getProposalsForJob(UUID jobId, UUID employerId, Pageable pageable) {

        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getEmployerId().equals(employerId)) {
            throw new RuntimeException("You are not authorized to view proposals for this job");
        }

        return proposalRepository.findByJobIdOrderByCreatedAtDesc(jobId, pageable)
            .map(proposal -> {
                User freelancer = userRepository.findById(proposal.getFreelancerId()).orElse(null);
                return mapToProposalResponse(proposal, job, freelancer);
            });
    }

    
    public Page<ProposalResponse> getFreelancerProposals(UUID freelancerId, Pageable pageable) {
        return proposalRepository.findByFreelancerIdOrderByCreatedAtDesc(freelancerId, pageable)
            .map(proposal -> {
                Job job = jobRepository.findById(proposal.getJobId()).orElse(null);
                User freelancer = userRepository.findById(freelancerId).orElse(null);
                return mapToProposalResponse(proposal, job, freelancer);
            });
    }

    
    public ProposalResponse getProposalById(UUID proposalId, UUID userId) {
        Proposal proposal = proposalRepository.findById(proposalId)
            .orElseThrow(() -> new RuntimeException("Proposal not found"));

        Job job = jobRepository.findById(proposal.getJobId()).orElse(null);
        
        if (job != null && !job.getEmployerId().equals(userId) && 
            !proposal.getFreelancerId().equals(userId)) {
            throw new RuntimeException("Not authorized to view this proposal");
        }

        User freelancer = userRepository.findById(proposal.getFreelancerId()).orElse(null);
        return mapToProposalResponse(proposal, job, freelancer);
    }

    
    @Transactional
    public ProposalResponse awardProposal(UUID proposalId, UUID employerId) {

        Proposal proposal = proposalRepository.findById(proposalId)
            .orElseThrow(() -> new RuntimeException("Proposal not found"));
        
        if (proposal.getStatus() != Proposal.ProposalStatus.PENDING) {
            throw new RuntimeException("Only pending proposals can be awarded");
        }
        
        Job job = jobRepository.findById(proposal.getJobId())
            .orElseThrow(() -> new RuntimeException("Job not found"));

        if (job.getStatus() != Job.JobStatus.OPEN) {
            throw new RuntimeException("Job is not open for awarding (Status: " + job.getStatus() + ")");
        }
        
        if (!job.getEmployerId().equals(employerId)) {
            throw new RuntimeException("You are not authorized to award this proposal");
        }
        
        BigDecimal availableBalance = pointsService.getAvailableBalance(employerId);
        if (availableBalance.compareTo(proposal.getProposedAmount()) < 0) {
            throw new RuntimeException("Insufficient balance. Available: " + availableBalance + " Points, Required: " + proposal.getProposedAmount());
        }
        
        log.info("Creating project: jobId={}, employerId={}, freelancerId={}", 
            job.getId(), employerId, proposal.getFreelancerId());
            
        Project project = Project.builder()
            .jobId(job.getId())
            .employerId(employerId)
            .freelancerId(proposal.getFreelancerId())
            .awardedProposalId(proposal.getId())
            .agreedAmount(proposal.getProposedAmount())
            .status(Project.ProjectStatus.IN_PROGRESS)
            .startedAt(LocalDateTime.now())
            .build();

        Project savedProject = projectRepository.save(project);
        log.info("Project created: projectId={}, amount={}", savedProject.getId(), proposal.getProposedAmount());

        escrowService.lockProjectEscrow(savedProject.getId(), employerId, proposal.getProposedAmount());
        log.info("Funds locked: amount={}, projectId={}", proposal.getProposedAmount(), savedProject.getId());

        conversationService.createConversationForProject(savedProject.getId());
        log.info("Conversation created for projectId={}", savedProject.getId());
        
        proposal.setStatus(Proposal.ProposalStatus.AWARDED);
        proposal.setAwardedAt(LocalDateTime.now());
        Proposal savedProposal = proposalRepository.save(proposal);
        
        job.setStatus(Job.JobStatus.CLOSED);
        jobRepository.save(job);
        
        List<Proposal> otherProposals = proposalRepository.findByJobIdOrderByCreatedAtDesc(job.getId(), Pageable.unpaged())
            .getContent()
            .stream()
            .filter(p -> !p.getId().equals(proposalId) && p.getStatus() == Proposal.ProposalStatus.PENDING)
            .toList();
        
        for (Proposal otherProposal : otherProposals) {
            otherProposal.setStatus(Proposal.ProposalStatus.REJECTED);
            proposalRepository.save(otherProposal);
            notificationService.notifyProposalRejected(
                otherProposal.getFreelancerId(),
                job.getId(),
                job.getTitle()
            );
        }
        
        log.info("Auto-rejected {} proposals for jobId={}", otherProposals.size(), job.getId());
        
        employerProfileService.incrementActiveProjects(employerId);
        log.debug("Incremented active_projects for employerId={}", employerId);
        
        notificationService.notifyProposalAccepted(
            proposal.getFreelancerId(),
            savedProject.getId(),
            job.getTitle()
        );
        
        log.info("Proposal awarded: proposalId={}, projectId={}, amount={}", 
            proposalId, savedProject.getId(), proposal.getProposedAmount());
        
        User freelancer = userRepository.findById(proposal.getFreelancerId()).orElse(null);
        return mapToProposalResponse(savedProposal, job, freelancer);
    }

    
    private ProposalResponse mapToProposalResponse(Proposal proposal, Job job, User freelancer) {
        ProposalResponse.ProposalResponseBuilder builder = ProposalResponse.builder()
            .id(proposal.getId())
            .jobId(proposal.getJobId())
            .freelancerId(proposal.getFreelancerId())
            .coverLetter(proposal.getCoverLetter())
            .proposedAmount(proposal.getProposedAmount())
            .estimatedDurationDays(proposal.getEstimatedDurationDays())
            .status(proposal.getStatus().name())
            .awardedAt(proposal.getAwardedAt())
            .createdAt(proposal.getCreatedAt())
            .updatedAt(proposal.getUpdatedAt());

        if (job != null) {
            builder.jobTitle(job.getTitle());
        }

        if (freelancer != null) {
            builder.freelancerName(freelancer.getFullName());
            builder.freelancerAvatar(freelancer.getAvatar());

            FreelancerProfile profile = freelancerProfileRepository.findByUserId(freelancer.getId())
                .orElse(null);
            
            if (profile != null) {
                builder.freelancerRating(profile.getAvgRating() != null ? profile.getAvgRating().doubleValue() : 0.0);
                builder.freelancerCompletedJobs(profile.getJobsCompleted() != null ? profile.getJobsCompleted() : 0);
            }
        }

        return builder.build();
    }


    @Transactional
    public ProposalResponse updateProposal(UUID proposalId, UUID freelancerId, 
                                          ProposalCreateRequest request) {
        log.info("🔄 Updating proposal: {} by freelancer: {}", proposalId, freelancerId);

        Proposal proposal = proposalRepository.findById(proposalId)
            .orElseThrow(() -> new RuntimeException("Proposal not found"));

        if (!proposal.getFreelancerId().equals(freelancerId)) {
            throw new RuntimeException("You are not authorized to update this proposal");
        }

        if (proposal.getStatus() != Proposal.ProposalStatus.PENDING) {
            throw new RuntimeException("Cannot update proposal that is not PENDING");
        }

        proposal.setCoverLetter(request.getCoverLetter());
        proposal.setProposedAmount(request.getProposedAmount());
        proposal.setEstimatedDurationDays(request.getEstimatedDurationDays());

        Proposal updatedProposal = proposalRepository.save(proposal);
        log.info("✅ Proposal updated successfully: {}", proposalId);

        Job job = jobRepository.findById(proposal.getJobId()).orElse(null);
        User freelancer = userRepository.findById(freelancerId).orElse(null);

        return mapToProposalResponse(updatedProposal, job, freelancer);
    }

    
    @Transactional
    public ProposalResponse withdrawProposal(UUID proposalId, UUID freelancerId) {
        log.info("❌ Withdrawing proposal: {} by freelancer: {}", proposalId, freelancerId);

        Proposal proposal = proposalRepository.findById(proposalId)
            .orElseThrow(() -> new RuntimeException("Proposal not found"));

        if (!proposal.getFreelancerId().equals(freelancerId)) {
            throw new RuntimeException("You are not authorized to withdraw this proposal");
        }

        if (proposal.getStatus() != Proposal.ProposalStatus.PENDING) {
            throw new RuntimeException("Cannot withdraw proposal that is not PENDING");
        }

        proposal.setStatus(Proposal.ProposalStatus.WITHDRAWN);
        Proposal withdrawnProposal = proposalRepository.save(proposal);
        log.info("✅ Proposal withdrawn successfully: {}", proposalId);

        Job job = jobRepository.findById(proposal.getJobId()).orElse(null);
        User freelancer = userRepository.findById(freelancerId).orElse(null);

        return mapToProposalResponse(withdrawnProposal, job, freelancer);
    }
}