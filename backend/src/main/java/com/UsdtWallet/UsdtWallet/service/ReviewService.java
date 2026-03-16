package com.UsdtWallet.UsdtWallet.service;

import com.UsdtWallet.UsdtWallet.model.dto.request.ReviewCreateRequest;
import com.UsdtWallet.UsdtWallet.model.dto.response.ReviewResponse;
import com.UsdtWallet.UsdtWallet.model.entity.*;
import com.UsdtWallet.UsdtWallet.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final FreelancerProfileRepository freelancerProfileRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final NotificationService notificationService;

    
    @Transactional
    public ReviewResponse createReview(UUID reviewerId, ReviewCreateRequest request) {

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (project.getStatus() != Project.ProjectStatus.COMPLETED) {
            throw new RuntimeException("Can only review completed projects");
        }

        if (!project.getEmployerId().equals(reviewerId) && !project.getFreelancerId().equals(reviewerId)) {
            throw new RuntimeException("You are not authorized to review this project");
        }

        UUID expectedRevieweeId = project.getEmployerId().equals(reviewerId) 
                ? project.getFreelancerId() 
                : project.getEmployerId();

        if (!expectedRevieweeId.equals(request.getRevieweeId())) {
            throw new RuntimeException("Invalid reviewee ID");
        }

        if (reviewRepository.existsByProjectIdAndReviewerId(request.getProjectId(), reviewerId)) {
            throw new RuntimeException("You have already reviewed this project");
        }

        User reviewee = userRepository.findById(request.getRevieweeId())
                .orElseThrow(() -> new RuntimeException("Reviewee not found"));

        Review review = Review.builder()
                .projectId(request.getProjectId())
                .reviewerId(reviewerId)
                .revieweeId(request.getRevieweeId())
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        review = reviewRepository.save(review);
        log.info("Review created: {} -> {}, rating: {}", reviewerId, request.getRevieweeId(), request.getRating());

        updateUserAverageRating(request.getRevieweeId());

        notificationService.createNotification(
                request.getRevieweeId(),
                Notification.NotificationType.SYSTEM_ALERT,
                "Nhận được đánh giá mới",
                String.format("Bạn đã nhận được đánh giá %d sao cho công việc của mình.", request.getRating()),
                "REVIEW",
                review.getId()
        );

        return mapToResponse(review);
    }

    
    @Transactional
    public void updateUserAverageRating(UUID userId) {
        Double avgRating = reviewRepository.calculateAverageRating(userId);
        long reviewCount = reviewRepository.countByRevieweeId(userId);
        
        if (avgRating != null) {
            BigDecimal roundedRating = BigDecimal.valueOf(avgRating)
                    .setScale(2, RoundingMode.HALF_UP);

            freelancerProfileRepository.findByUserId(userId).ifPresent(profile -> {
                profile.setAvgRating(roundedRating);
                profile.setJobsCompleted((int) reviewCount); 
                freelancerProfileRepository.save(profile);
                log.info("Updated freelancer {} avg rating to {}", userId, roundedRating);
            });

            employerProfileRepository.findByUserId(userId).ifPresent(profile -> {
                profile.setAvgRating(roundedRating);
                profile.setReviewCount((int) reviewCount);
                employerProfileRepository.save(profile);
                log.info("Updated employer {} avg rating to {} and review count to {}", userId, roundedRating, reviewCount);
            });
        }
    }

    
    public Page<ReviewResponse> getReviewsForUser(UUID userId, Pageable pageable) {
        Page<Review> reviews = reviewRepository.findByRevieweeIdOrderByCreatedAtDesc(userId, pageable);
        return reviews.map(this::mapToResponse);
    }

    
    public Page<ReviewResponse> getReviewsByUser(UUID userId, Pageable pageable) {
        Page<Review> reviews = reviewRepository.findByReviewerIdOrderByCreatedAtDesc(userId, pageable);
        return reviews.map(this::mapToResponse);
    }

    
    public List<ReviewResponse> getReviewsByProject(UUID projectId) {
        List<Review> reviews = reviewRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
        return reviews.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    
    public ReviewStatistics getUserReviewStatistics(UUID userId) {
        Double avgRating = reviewRepository.calculateAverageRating(userId);
        long totalReviews = reviewRepository.countByRevieweeId(userId);

        long fiveStars = reviewRepository.findByRevieweeIdAndRatingOrderByCreatedAtDesc(userId, 5).size();
        long fourStars = reviewRepository.findByRevieweeIdAndRatingOrderByCreatedAtDesc(userId, 4).size();
        long threeStars = reviewRepository.findByRevieweeIdAndRatingOrderByCreatedAtDesc(userId, 3).size();
        long twoStars = reviewRepository.findByRevieweeIdAndRatingOrderByCreatedAtDesc(userId, 2).size();
        long oneStar = reviewRepository.findByRevieweeIdAndRatingOrderByCreatedAtDesc(userId, 1).size();

        return ReviewStatistics.builder()
                .userId(userId)
                .averageRating(avgRating != null ? 
                        BigDecimal.valueOf(avgRating).setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO)
                .totalReviews(totalReviews)
                .fiveStars(fiveStars)
                .fourStars(fourStars)
                .threeStars(threeStars)
                .twoStars(twoStars)
                .oneStar(oneStar)
                .build();
    }

    
    public boolean hasUserReviewedProject(UUID projectId, UUID userId) {
        return reviewRepository.existsByProjectIdAndReviewerId(projectId, userId);
    }

    
    private ReviewResponse mapToResponse(Review review) {
        User reviewer = userRepository.findById(review.getReviewerId()).orElse(null);
        User reviewee = userRepository.findById(review.getRevieweeId()).orElse(null);
        Project project = projectRepository.findById(review.getProjectId()).orElse(null);

        return ReviewResponse.builder()
                .id(review.getId())
                .projectId(review.getProjectId())
                .reviewerId(review.getReviewerId())
                .reviewerName(reviewer != null ? reviewer.getFullName() : "Unknown")
                .reviewerAvatar(reviewer != null ? reviewer.getAvatar() : null)
                .revieweeId(review.getRevieweeId())
                .revieweeName(reviewee != null ? reviewee.getFullName() : "Unknown")
                .revieweeAvatar(reviewee != null ? reviewee.getAvatar() : null)
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .projectTitle(project != null ? project.getJob().getTitle() : null)
                .build();
    }

    
    @lombok.Data
    @lombok.Builder
    public static class ReviewStatistics {
        private UUID userId;
        private BigDecimal averageRating;
        private long totalReviews;
        private long fiveStars;
        private long fourStars;
        private long threeStars;
        private long twoStars;
        private long oneStar;
    }
}
