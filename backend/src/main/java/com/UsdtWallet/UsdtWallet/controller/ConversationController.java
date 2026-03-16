package com.UsdtWallet.UsdtWallet.controller;

import com.UsdtWallet.UsdtWallet.model.dto.response.ApiResponse;
import com.UsdtWallet.UsdtWallet.model.dto.response.ConversationResponse;
import com.UsdtWallet.UsdtWallet.model.entity.Conversation;
import com.UsdtWallet.UsdtWallet.model.entity.ConversationParticipant;
import com.UsdtWallet.UsdtWallet.repository.ConversationParticipantRepository;
import com.UsdtWallet.UsdtWallet.security.UserPrincipal;
import com.UsdtWallet.UsdtWallet.service.ConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
@PreAuthorize("hasRole('FREELANCER') or hasRole('EMPLOYER')")
public class ConversationController {

    private final ConversationService conversationService;
    private final ConversationParticipantRepository participantRepository;

    /**
     * 🆕 Create or get conversation for a project
     * POST /api/conversations
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Conversation>> createOrGetConversation(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody Map<String, String> request) {
        
        String projectIdStr = request.get("projectId");
        if (projectIdStr == null || projectIdStr.isEmpty()) {
            throw new IllegalArgumentException("projectId is required");
        }
        
        UUID projectId = UUID.fromString(projectIdStr);
        Conversation conversation = conversationService.getOrCreateConversationForProject(projectId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Conversation ready", conversation));
    }

    /**
     * 💬 Get conversation by project ID
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse<Conversation>> getConversationByProject(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID projectId) {
        
        Conversation conversation = conversationService.getConversationByProjectId(projectId);
        return ResponseEntity.ok(ApiResponse.success("Conversation retrieved", conversation));
    }

    /**
     * 💬 Get conversation by job ID
     */
    @GetMapping("/job/{jobId}")
    public ResponseEntity<ApiResponse<Conversation>> getConversationByJob(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID jobId) {
        
        Conversation conversation = conversationService.getConversationByJobId(jobId);
        return ResponseEntity.ok(ApiResponse.success("Conversation retrieved", conversation));
    }

    /**
     * ✅ Check if conversation exists for project
     */
    @GetMapping("/project/{projectId}/exists")
    public ResponseEntity<ApiResponse<Boolean>> checkConversationExists(
            @PathVariable UUID projectId) {
        
        boolean exists = conversationService.conversationExistsForProject(projectId);
        return ResponseEntity.ok(ApiResponse.success("Checked", exists));
    }
    
    /**
     * 📖 Mark conversation as read
     */
    @PostMapping("/{conversationId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID conversationId) {
        
        conversationService.markAsRead(conversationId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Conversation marked as read", null));
    }
    
    /**
     * 🔢 Get total unread count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Integer>> getTotalUnreadCount(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        int count = conversationService.getTotalUnreadCount(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Unread count retrieved", count));
    }
    
    /**
     * 📋 Get all my conversations
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<ConversationResponse>>> getMyConversations(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        List<ConversationResponse> conversations = conversationService.getUserConversations(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Conversations retrieved", conversations));
    }
    
    /**
     * 🔇 Mute/Unmute conversation
     */
    @PutMapping("/{conversationId}/mute")
    public ResponseEntity<ApiResponse<Void>> toggleMuteConversation(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID conversationId,
            @RequestBody Map<String, Boolean> request) {
        
        boolean muted = request.getOrDefault("muted", false);
        participantRepository.updateMuteStatus(conversationId, currentUser.getId(), muted);
        return ResponseEntity.ok(ApiResponse.success(muted ? "Conversation muted" : "Conversation unmuted", null));
    }
    
    /**
     * 👥 Get conversation participants
     */
    @GetMapping("/{conversationId}/participants")
    public ResponseEntity<ApiResponse<List<ConversationParticipant>>> getConversationParticipants(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID conversationId) {
        
        List<ConversationParticipant> participants = 
            participantRepository.findByConversationIdAndLeftAtIsNull(conversationId);
        return ResponseEntity.ok(ApiResponse.success("Participants retrieved", participants));
    }
}
