package com.UsdtWallet.UsdtWallet.service;

import com.UsdtWallet.UsdtWallet.model.dto.response.ConversationResponse;
import com.UsdtWallet.UsdtWallet.model.entity.*;
import com.UsdtWallet.UsdtWallet.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository participantRepository;
    private final ProjectRepository projectRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    /**
     * 🆕 Create conversation for a project (auto-called when project is created)
     */
    @Transactional
    public Conversation createConversationForProject(UUID projectId) {
        // Check if conversation already exists
        if (conversationRepository.findByProjectId(projectId).isPresent()) {
            log.warn("Conversation already exists for project: {}", projectId);
            return conversationRepository.findByProjectId(projectId).get();
        }

        // Validate project exists
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found"));

        // Create conversation
        Conversation conversation = Conversation.builder()
            .projectId(projectId)
            .jobId(project.getJobId())
            .createdAt(LocalDateTime.now())
            .build();

        Conversation saved = conversationRepository.save(conversation);
        
        // ✅ Create participants for employer and freelancer
        addParticipant(saved.getId(), project.getEmployerId(), ConversationParticipant.ParticipantRole.EMPLOYER);
        addParticipant(saved.getId(), project.getFreelancerId(), ConversationParticipant.ParticipantRole.FREELANCER);
        
        log.info("✅ Conversation created: {} for project: {} with participants", saved.getId(), projectId);

        return saved;
    }
    
    /**
     * 🆕 Get or create conversation for project (with user validation)
     */
    @Transactional
    public Conversation getOrCreateConversationForProject(UUID projectId, UUID currentUserId) {
        // Validate project exists
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found"));
        
        // Validate user is part of the project
        if (!project.getEmployerId().equals(currentUserId) && !project.getFreelancerId().equals(currentUserId)) {
            throw new RuntimeException("You are not authorized to access this project's conversation");
        }
        
        // Try to find existing conversation
        Optional<Conversation> existing = conversationRepository.findByProjectId(projectId);
        if (existing.isPresent()) {
            return existing.get();
        }
        
        // Create new conversation
        return createConversationForProject(projectId);
    }
    
    /**
     * Add a participant to conversation
     */
    @Transactional
    public void addParticipant(UUID conversationId, UUID userId, ConversationParticipant.ParticipantRole role) {
        if (participantRepository.existsByConversationIdAndUserIdAndLeftAtIsNull(conversationId, userId)) {
            log.warn("User {} is already a participant in conversation {}", userId, conversationId);
            return;
        }
        
        ConversationParticipant participant = ConversationParticipant.builder()
            .conversationId(conversationId)
            .userId(userId)
            .role(role)
            .unreadCount(0)
            .isMuted(false)
            .build();
        
        participantRepository.save(participant);
        log.info("✅ Added participant {} to conversation {} with role {}", userId, conversationId, role);
    }
    
    /**
     * Mark conversation as read for user
     */
    @Transactional
    public void markAsRead(UUID conversationId, UUID userId) {
        participantRepository.markAsRead(conversationId, userId, LocalDateTime.now());
    }
    
    /**
     * Get unread count for user
     */
    public int getTotalUnreadCount(UUID userId) {
        Integer count = participantRepository.getTotalUnreadCount(userId);
        return count != null ? count : 0;
    }

    /**
     * Get conversation by project ID
     */
    public Conversation getConversationByProjectId(UUID projectId) {
        return conversationRepository.findByProjectId(projectId)
            .orElseThrow(() -> new RuntimeException("No conversation found for this project"));
    }

    /**
     * Get conversation by job ID (for pre-project discussions)
     */
    public Conversation getConversationByJobId(UUID jobId) {
        return conversationRepository.findByJobId(jobId)
            .orElseThrow(() -> new RuntimeException("No conversation found for this job"));
    }

    /**
     * Check if conversation exists for project
     */
    public boolean conversationExistsForProject(UUID projectId) {
        return conversationRepository.findByProjectId(projectId).isPresent();
    }

    /**
     * Lấy tất cả conversations của user
     */
    public List<ConversationResponse> getUserConversations(UUID userId) {
        // ✅ Use participant table for efficient lookup
        List<ConversationParticipant> participations = participantRepository.findByUserIdAndLeftAtIsNull(userId);
        
        return participations.stream()
            .map(p -> {
                Conversation conv = conversationRepository.findById(p.getConversationId()).orElse(null);
                if (conv == null) return null;
                return mapToResponse(conv, userId, p.getUnreadCount());
            })
            .filter(res -> res != null)
            .collect(Collectors.toList());
    }

    /**
     * Lấy conversation theo ID với validation
     */
    public ConversationResponse getConversationById(UUID conversationId, UUID userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        if (!isUserPartOfConversation(conversation, userId)) {
            throw new RuntimeException("You are not authorized to access this conversation");
        }

        ConversationParticipant p = participantRepository.findByConversationIdAndUserId(conversationId, userId)
                .orElse(null);
        Integer unreadCount = (p != null) ? p.getUnreadCount() : 0;

        return mapToResponse(conversation, userId, unreadCount);
    }

    /**
     * Check if user is part of conversation
     */
    private boolean isUserPartOfConversation(Conversation conversation, UUID userId) {
        // ✅ First check participant table (more efficient)
        if (participantRepository.existsByConversationIdAndUserIdAndLeftAtIsNull(conversation.getId(), userId)) {
            return true;
        }
        
        // Fallback to project/job check for legacy data
        if (conversation.getJobId() != null) {
            Optional<Job> job = jobRepository.findById(conversation.getJobId());
            if (job.isPresent()) {
                return job.get().getEmployerId().equals(userId);
            }
        }
        
        if (conversation.getProjectId() != null) {
            Optional<Project> project = projectRepository.findById(conversation.getProjectId());
            if (project.isPresent()) {
                return project.get().getEmployerId().equals(userId) || 
                       project.get().getFreelancerId().equals(userId);
            }
        }
        
        return false;
    }

    /**
     * Map entity to response
     */
    private ConversationResponse mapToResponse(Conversation conversation, UUID currentUserId, Integer unreadCount) {
        ConversationResponse.ConversationResponseBuilder builder = ConversationResponse.builder()
                .id(conversation.getId())
                .jobId(conversation.getJobId())
                .projectId(conversation.getProjectId())
                .createdAt(conversation.getCreatedAt())
                .lastMessagePreview(conversation.getLastMessagePreview())
                .lastMessageAt(conversation.getLastMessageAt())
                .unreadCount(unreadCount);

        // Add job/project title
        if (conversation.getJobId() != null) {
            jobRepository.findById(conversation.getJobId()).ifPresent(job -> {
                builder.title(job.getTitle());
                builder.type("JOB");
            });
        }
        
        if (conversation.getProjectId() != null) {
            projectRepository.findById(conversation.getProjectId()).ifPresent(project -> {
                if (project.getJob() != null) {
                    builder.title(project.getJob().getTitle());
                }
                builder.type("PROJECT");
                
                // Add other party info
                UUID otherPartyId = project.getEmployerId().equals(currentUserId) 
                        ? project.getFreelancerId() 
                        : project.getEmployerId();
                
                userRepository.findById(otherPartyId).ifPresent(user -> {
                    builder.otherPartyId(user.getId());
                    builder.otherPartyName(user.getFullName());
                    builder.otherPartyAvatar(user.getAvatar());
                });
            });
        }

        return builder.build();
    }
}
