package com.UsdtWallet.UsdtWallet.service;

import com.UsdtWallet.UsdtWallet.model.dto.request.JobCreateRequest;
import com.UsdtWallet.UsdtWallet.model.dto.response.JobResponse;
import com.UsdtWallet.UsdtWallet.model.entity.Job;
import com.UsdtWallet.UsdtWallet.model.entity.User;
import com.UsdtWallet.UsdtWallet.repository.JobRepository;
import com.UsdtWallet.UsdtWallet.repository.ProposalRepository;
import com.UsdtWallet.UsdtWallet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final ProposalRepository proposalRepository;
    private final PointsService pointsService;
    private final EmployerProfileService employerProfileService;
    private final NotificationService notificationService; 

    
    @Transactional
    public JobResponse createJob(UUID employerId, JobCreateRequest request) {

        User employer = userRepository.findById(employerId)
            .orElseThrow(() -> new RuntimeException("Employer not found"));

        if (request.getBudgetMin() != null && request.getBudgetMax() != null) {
            if (request.getBudgetMin().compareTo(request.getBudgetMax()) > 0) {
                throw new RuntimeException("Budget min cannot be greater than budget max");
            }
        }

        BigDecimal requiredBudget = request.getBudgetMax() != null ? request.getBudgetMax() : 
                                    (request.getBudgetMin() != null ? request.getBudgetMin() : BigDecimal.ZERO);
        
        BigDecimal availableBalance = pointsService.getAvailableBalance(employerId);
        if (availableBalance.compareTo(requiredBudget) < 0) {
            throw new RuntimeException("Insufficient balance to post this job. Required: " + 
                requiredBudget + " PTS, Available: " + availableBalance + " PTS");
        }

        List<String> jobSkills = new ArrayList<>();
        if (request.getSkills() != null && !request.getSkills().isEmpty()) {
            jobSkills.addAll(request.getSkills());
        }

        Job.ProjectType projectType = Job.ProjectType.valueOf(request.getType());
        
        Job job = Job.builder()
            .employerId(employerId)
            .title(request.getTitle())
            .description(request.getDescription())
            .projectType(projectType)
            .budgetMin(request.getBudgetMin())
            .budgetMax(request.getBudgetMax())
            .duration(request.getDuration())
            .deadline(request.getDeadline())
            .category(request.getCategory())
            .status(Job.JobStatus.OPEN)
            .requiredSkills(jobSkills)
            .build();

        Job savedJob = jobRepository.save(job);
        log.info("Job created: {} by employer: {}", savedJob.getId(), employerId);

        employerProfileService.incrementJobsPosted(employerId);

        notificationService.notifyJobPosted(employerId, savedJob.getId(), savedJob.getTitle());

        return mapToJobResponse(savedJob, employerId);
    }

    
    public Page<JobResponse> getEmployerJobs(UUID employerId, Pageable pageable) {
        return jobRepository.findByEmployerIdOrderByCreatedAtDesc(employerId, pageable)
            .map(job -> mapToJobResponse(job, employerId));
    }

    
    public Page<JobResponse> browseJobs(Pageable pageable, UUID currentUserId) {
        return jobRepository.findByStatusOrderByCreatedAtDesc(Job.JobStatus.OPEN, pageable)
            .map(job -> mapToJobResponse(job, currentUserId));
    }

    
    public Page<JobResponse> searchJobs(String keyword, Pageable pageable, UUID currentUserId) {
        return jobRepository.searchJobs(Job.JobStatus.OPEN, keyword, pageable)
            .map(job -> mapToJobResponse(job, currentUserId));
    }

    
    public Page<JobResponse> filterJobs(String skills, BigDecimal minBudget, BigDecimal maxBudget, Pageable pageable, UUID currentUserId) {
        log.info("🔍 Filtering jobs - skills: {}, minBudget: {}, maxBudget: {}", skills, minBudget, maxBudget);

        Set<String> skillSet = null;
        if (skills != null && !skills.trim().isEmpty()) {
            skillSet = Arrays.stream(skills.split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .collect(Collectors.toSet());
        }

        Page<Job> jobs;

        if (minBudget != null || maxBudget != null) {
            BigDecimal min = minBudget != null ? minBudget : BigDecimal.ZERO;
            BigDecimal max = maxBudget != null ? maxBudget : new BigDecimal("9999999999");
            jobs = jobRepository.findByBudgetRange(Job.JobStatus.OPEN, min, max, pageable);
        } else {
            jobs = jobRepository.findByStatusOrderByCreatedAtDesc(Job.JobStatus.OPEN, pageable);
        }

        if (skillSet != null) {
            final Set<String> finalSkillSet = skillSet;
            return jobs.map(job -> {

                boolean hasSkill = job.getRequiredSkills().stream()
                    .anyMatch(skill -> finalSkillSet.contains(skill.toLowerCase()));
                return hasSkill ? mapToJobResponse(job, currentUserId) : null;
            }).map(job -> job); 
        }
        
        return jobs.map(job -> mapToJobResponse(job, currentUserId));
    }

    
    public JobResponse getJobById(UUID jobId, UUID currentUserId) {
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found"));

        if (currentUserId != null && !job.getEmployerId().equals(currentUserId)) {
            proposalRepository.findByJobIdAndFreelancerId(jobId, currentUserId).ifPresent(proposal -> {
                if ("REJECTED".equals(proposal.getStatus().name())) {
                    throw new RuntimeException("You cannot view this job because your proposal was rejected.");
                }
            });
        }

        return mapToJobResponse(job, currentUserId);
    }

    
    private JobResponse mapToJobResponse(Job job, UUID currentUserId) {
        User employer = userRepository.findById(job.getEmployerId()).orElse(null);

        int proposalCount = (int) proposalRepository.countByJobId(job.getId());

        String employerName = "User_" + job.getEmployerId().toString().substring(0, 8);
        if (employer != null) {
            employerName = (employer.getFullName() != null && !employer.getFullName().isBlank()) 
                           ? employer.getFullName() : employer.getUsername();
        }

        JobResponse.JobResponseBuilder builder = JobResponse.builder()
            .id(job.getId())
            .employerId(job.getEmployerId())
            .employerName(employerName)
            .employerAvatar(employer != null ? employer.getAvatar() : null)
            .title(job.getTitle())
            .description(job.getDescription())
            .type(job.getProjectType().name())
            .budgetMin(job.getBudgetMin())
            .budgetMax(job.getBudgetMax())
            .duration(job.getDuration())  
            .deadline(job.getDeadline())
            .status(job.getStatus().name())
            .category(job.getCategory())
            .skills(job.getRequiredSkills())
            .proposalCount(proposalCount)
            .createdAt(job.getCreatedAt())
            .updatedAt(job.getUpdatedAt());

        if (currentUserId != null) {
            proposalRepository.findByJobIdAndFreelancerId(job.getId(), currentUserId)
                .ifPresent(p -> {
                    builder.hasApplied(true);
                    builder.appliedProposalId(p.getId());
                });
        }
        
        return builder.build();
    }

    
    @Transactional
    public JobResponse updateJob(UUID jobId, UUID employerId, JobCreateRequest request) {
        log.info("🔄 Updating job: {} by employer: {}", jobId, employerId);

        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getEmployerId().equals(employerId)) {
            throw new RuntimeException("You are not authorized to update this job");
        }

        if (job.getStatus() != Job.JobStatus.OPEN) {
            throw new RuntimeException("Cannot update job that is not OPEN");
        }

        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setBudgetMin(request.getBudgetMin());
        job.setBudgetMax(request.getBudgetMax());
        job.setDuration(request.getDuration());
        job.setDeadline(request.getDeadline());
        job.setCategory(request.getCategory());

        if (request.getSkills() != null && !request.getSkills().isEmpty()) {
            job.setRequiredSkills(new ArrayList<>(request.getSkills()));
        }

        Job updatedJob = jobRepository.save(job);
        log.info("✅ Job updated successfully: {}", jobId);

        return mapToJobResponse(updatedJob, employerId);
    }

    
    @Transactional
    public void deleteJob(UUID jobId, UUID employerId) {
        log.info("❌ Deleting job: {} by employer: {}", jobId, employerId);

        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getEmployerId().equals(employerId)) {
            throw new RuntimeException("You are not authorized to delete this job");
        }


        if (job.getStatus() == Job.JobStatus.IN_PROGRESS) {
            throw new RuntimeException("Cannot delete job that has an active project");
        }

        jobRepository.delete(job);
        log.info("✅ Job deleted successfully: {}", jobId);
    }

    
    @Transactional
    public JobResponse closeJob(UUID jobId, UUID employerId) {
        log.info("🔒 Closing job: {} by employer: {}", jobId, employerId);

        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getEmployerId().equals(employerId)) {
            throw new RuntimeException("You are not authorized to close this job");
        }

        if (job.getStatus() != Job.JobStatus.OPEN) {
            throw new RuntimeException("Job is already closed or in progress");
        }

        job.setStatus(Job.JobStatus.CLOSED);
        Job closedJob = jobRepository.save(job);
        log.info("✅ Job closed successfully: {}", jobId);

        return mapToJobResponse(closedJob, employerId);
    }
}