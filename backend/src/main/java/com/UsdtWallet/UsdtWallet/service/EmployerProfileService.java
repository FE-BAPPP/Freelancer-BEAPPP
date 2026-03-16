package com.UsdtWallet.UsdtWallet.service;

import com.UsdtWallet.UsdtWallet.model.entity.EmployerProfile;
import com.UsdtWallet.UsdtWallet.model.entity.User;
import com.UsdtWallet.UsdtWallet.model.dto.request.EmployerProfileRequest;
import com.UsdtWallet.UsdtWallet.model.dto.response.EmployerProfileResponse;
import com.UsdtWallet.UsdtWallet.repository.EmployerProfileRepository;
import com.UsdtWallet.UsdtWallet.repository.ProjectRepository;
import com.UsdtWallet.UsdtWallet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;


@Service
@RequiredArgsConstructor
@Slf4j
public class EmployerProfileService {

    private final EmployerProfileRepository employerProfileRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    
    @Transactional(readOnly = true)
    public EmployerProfileResponse getProfileByUserId(UUID userId) {
        EmployerProfile profile = employerProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Employer profile not found"));
        
        return mapToResponse(profile);
    }

    
    @Transactional
    public EmployerProfileResponse createProfile(UUID userId, EmployerProfileRequest request) {
        log.info("🏢 Creating employer profile for user: {}", userId);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (employerProfileRepository.existsByUserId(userId)) {
            throw new RuntimeException("Employer profile already exists. Use PUT to update.");
        }

        EmployerProfile profile = EmployerProfile.builder()
            .user(user)
            .companyName(request.getCompanyName())
            .companyWebsite(request.getCompanyWebsite())
            .companySize(request.getCompanySize() != null ? EmployerProfile.CompanySize.valueOf(request.getCompanySize()) : null)
            .industry(request.getIndustry())
            .jobsPosted(0)
            .activeProjects(0)
            .totalSpent(BigDecimal.ZERO)
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();

        profile = employerProfileRepository.save(profile);
        log.info("✅ Employer profile created successfully: {}", profile.getId());

        return mapToResponse(profile);
    }

    
    @Transactional
    public EmployerProfileResponse updateProfile(UUID userId, EmployerProfileRequest request) {
        log.info("🔄 Updating employer profile for user: {}", userId);

        EmployerProfile profile = employerProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Employer profile not found. Create profile first."));

        profile.setCompanyName(request.getCompanyName());
        profile.setCompanyWebsite(request.getCompanyWebsite());
        if (request.getCompanySize() != null) {
            profile.setCompanySize(EmployerProfile.CompanySize.valueOf(request.getCompanySize()));
        }
        profile.setIndustry(request.getIndustry());
        profile.setUpdatedAt(LocalDateTime.now());

        profile = employerProfileRepository.save(profile);
        log.info("✅ Employer profile updated successfully: {}", profile.getId());

        return mapToResponse(profile);
    }

    
    @Transactional
    public void incrementJobsPosted(UUID userId) {
        employerProfileRepository.findByUserId(userId).ifPresent(profile -> {
            profile.setJobsPosted(profile.getJobsPosted() + 1);
            profile.setUpdatedAt(LocalDateTime.now());
            employerProfileRepository.save(profile);
            log.debug("📈 Incremented jobs_posted for employer: {}", userId);
        });
    }

    @Transactional
    public void incrementActiveProjects(UUID userId) {
        employerProfileRepository.findByUserId(userId).ifPresent(profile -> {
            profile.setActiveProjects(profile.getActiveProjects() + 1);
            profile.setUpdatedAt(LocalDateTime.now());
            employerProfileRepository.save(profile);
            log.debug("📈 Incremented active_projects for employer: {}", userId);
        });
    }

    @Transactional
    public void decrementActiveProjects(UUID userId) {
        employerProfileRepository.findByUserId(userId).ifPresent(profile -> {
            if (profile.getActiveProjects() > 0) {
                profile.setActiveProjects(profile.getActiveProjects() - 1);
                profile.setUpdatedAt(LocalDateTime.now());
                employerProfileRepository.save(profile);
                log.debug("📉 Decremented active_projects for employer: {}", userId);
            }
        });
    }

    @Transactional
    public void addToTotalSpent(UUID userId, BigDecimal amount) {
        employerProfileRepository.findByUserId(userId).ifPresent(profile -> {
            profile.setTotalSpent(profile.getTotalSpent().add(amount));
            profile.setUpdatedAt(LocalDateTime.now());
            employerProfileRepository.save(profile);
            log.debug("💰 Added {} to total_spent for employer: {}", amount, userId);
        });
    }

    
    private EmployerProfileResponse mapToResponse(EmployerProfile profile) {

        long activeProjectsCount = projectRepository.countByEmployerIdAndStatus(
            profile.getUser().getId(),
            com.UsdtWallet.UsdtWallet.model.entity.Project.ProjectStatus.IN_PROGRESS
        );

        return EmployerProfileResponse.builder()
            .id(profile.getId())
            .userId(profile.getUser().getId())
            .avatar(profile.getUser().getAvatar())  
            .companyName(profile.getCompanyName())
            .companyWebsite(profile.getCompanyWebsite())
            .companySize(profile.getCompanySize() != null ? profile.getCompanySize().name() : null)
            .industry(profile.getIndustry())
            .jobsPosted(profile.getJobsPosted())
            .activeProjects((int) activeProjectsCount)
            .totalSpent(profile.getTotalSpent())
            .avgRating(profile.getAvgRating())
            .reviewCount(profile.getReviewCount())
            .createdAt(profile.getCreatedAt())
            .updatedAt(profile.getUpdatedAt())
            .build();
    }
}
