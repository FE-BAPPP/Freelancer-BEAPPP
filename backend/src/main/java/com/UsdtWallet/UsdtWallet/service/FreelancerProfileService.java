package com.UsdtWallet.UsdtWallet.service;

import com.UsdtWallet.UsdtWallet.model.dto.request.FreelancerProfileUpdateRequest;
import com.UsdtWallet.UsdtWallet.model.dto.response.FreelancerProfileResponse;
import com.UsdtWallet.UsdtWallet.model.entity.FreelancerProfile;
import com.UsdtWallet.UsdtWallet.model.entity.User;
import com.UsdtWallet.UsdtWallet.repository.FreelancerProfileRepository;
import com.UsdtWallet.UsdtWallet.repository.ProjectRepository;
import com.UsdtWallet.UsdtWallet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FreelancerProfileService {

    private final FreelancerProfileRepository freelancerProfileRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    
    public FreelancerProfileResponse getFreelancerProfile(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        FreelancerProfile profile = freelancerProfileRepository.findByUser(user)
            .orElseThrow(() -> new RuntimeException("Freelancer profile not found"));

        return mapToResponse(profile);
    }

    
    @Transactional
    public FreelancerProfileResponse updateFreelancerProfile(UUID userId, FreelancerProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        FreelancerProfile profile = freelancerProfileRepository.findByUser(user)
            .orElseThrow(() -> new RuntimeException("Freelancer profile not found"));

        if (request.getProfessionalTitle() != null) {
            profile.setProfessionalTitle(request.getProfessionalTitle());
        }

        if (request.getBio() != null) {
            profile.setBio(request.getBio());
        }

        if (request.getHourlyRate() != null) {
            profile.setHourlyRate(request.getHourlyRate());
        }

        if (request.getAvailability() != null) {
            profile.setAvailability(FreelancerProfile.Availability.valueOf(request.getAvailability()));
        }

        if (request.getPortfolioUrl() != null) {
            profile.setPortfolioUrl(request.getPortfolioUrl());
        }

        if (request.getLinkedinUrl() != null) {
            profile.setLinkedinUrl(request.getLinkedinUrl());
        }

        if (request.getGithubUrl() != null) {
            profile.setGithubUrl(request.getGithubUrl());
        }

        profile.setUpdatedAt(LocalDateTime.now());
        FreelancerProfile saved = freelancerProfileRepository.save(profile);

        log.info("Freelancer profile updated for user: {}", userId);

        return mapToResponse(saved);
    }

    
    private FreelancerProfileResponse mapToResponse(FreelancerProfile profile) {
        User user = profile.getUser();

        long activeProjects = projectRepository.countByFreelancerIdAndStatus(
            user.getId(), 
            com.UsdtWallet.UsdtWallet.model.entity.Project.ProjectStatus.IN_PROGRESS
        );

        return FreelancerProfileResponse.builder()
            .id(profile.getId())
            .userId(user.getId())
            .userName(user.getFullName() != null ? user.getFullName() : user.getUsername())
            .userEmail(user.getEmail())
            .avatar(user.getAvatar())
            .professionalTitle(profile.getProfessionalTitle())
            .bio(profile.getBio())
            .hourlyRate(profile.getHourlyRate())
            .availability(profile.getAvailability() != null ? profile.getAvailability().name() : null)
            .portfolioUrl(profile.getPortfolioUrl())
            .linkedinUrl(profile.getLinkedinUrl())
            .githubUrl(profile.getGithubUrl())
            .totalEarnings(profile.getTotalEarnings() != null ? profile.getTotalEarnings() : BigDecimal.ZERO)
            .jobsCompleted(profile.getJobsCompleted() != null ? profile.getJobsCompleted() : 0)
            .avgRating(profile.getAvgRating() != null ? profile.getAvgRating().doubleValue() : 0.0)
            .activeProjects((int) activeProjects)
            .skills(new HashSet<>(profile.getSkills()))
            .createdAt(profile.getCreatedAt())
            .updatedAt(profile.getUpdatedAt())
            .build();
    }
    
    
    @Transactional
    public Set<String> updateSkillsSimple(UUID userId, List<String> skillNames) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
            
        FreelancerProfile profile = freelancerProfileRepository.findByUser(user)
            .orElseThrow(() -> new RuntimeException("Profile not found"));

        profile.getSkills().clear();
        profile.getSkills().addAll(skillNames);
        freelancerProfileRepository.save(profile);
        
        log.info("✅ Updated {} skills for freelancer {}", skillNames.size(), userId);
        
        return new HashSet<>(profile.getSkills());
    }

    
    @Transactional
    public void incrementJobsCompleted(UUID userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;
        
        freelancerProfileRepository.findByUser(user).ifPresent(profile -> {
            profile.setJobsCompleted((profile.getJobsCompleted() != null ? profile.getJobsCompleted() : 0) + 1);
            freelancerProfileRepository.save(profile);
            log.debug("📈 Incremented jobs_completed for freelancer: {}", userId);
        });
    }

    
    @Transactional
    public void addToTotalEarnings(UUID userId, BigDecimal amount) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;
        
        freelancerProfileRepository.findByUser(user).ifPresent(profile -> {
            BigDecimal currentEarnings = profile.getTotalEarnings() != null ? profile.getTotalEarnings() : BigDecimal.ZERO;
            profile.setTotalEarnings(currentEarnings.add(amount));
            freelancerProfileRepository.save(profile);
            log.debug("💰 Added {} to total_earnings for freelancer: {}", amount, userId);
        });
    }

    
    @Transactional
    public void updateAverageRating(UUID userId, BigDecimal newRating, int totalReviews) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;
        
        freelancerProfileRepository.findByUser(user).ifPresent(profile -> {
            BigDecimal currentAvg = profile.getAvgRating() != null ? profile.getAvgRating() : BigDecimal.ZERO;
            BigDecimal currentTotal = currentAvg.multiply(BigDecimal.valueOf(totalReviews - 1));
            BigDecimal newTotal = currentTotal.add(newRating);
            BigDecimal newAvg = newTotal.divide(BigDecimal.valueOf(totalReviews), 2, java.math.RoundingMode.HALF_UP);
            
            profile.setAvgRating(newAvg);
            freelancerProfileRepository.save(profile);
            log.debug("⭐ Updated avg_rating to {} for freelancer: {}", newAvg, userId);
        });
    }
}