package com.UsdtWallet.UsdtWallet.repository;

import com.UsdtWallet.UsdtWallet.model.entity.ConversationParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConversationParticipantRepository extends JpaRepository<ConversationParticipant, UUID> {
    
    /**
     * Lấy tất cả participants của một conversation
     */
    List<ConversationParticipant> findByConversationIdAndLeftAtIsNull(UUID conversationId);
    
    /**
     * Lấy tất cả conversations mà user đang tham gia
     */
    List<ConversationParticipant> findByUserIdAndLeftAtIsNull(UUID userId);
    
    /**
     * Check user có trong conversation không
     */
    boolean existsByConversationIdAndUserIdAndLeftAtIsNull(UUID conversationId, UUID userId);
    
    /**
     * Lấy participant record của user trong conversation
     */
    Optional<ConversationParticipant> findByConversationIdAndUserId(UUID conversationId, UUID userId);
    
    /**
     * Đếm số unread messages của user trong conversation
     */
    @Query("SELECT SUM(cp.unreadCount) FROM ConversationParticipant cp WHERE cp.userId = :userId AND cp.leftAt IS NULL")
    Integer getTotalUnreadCount(UUID userId);
    
    /**
     * Reset unread count khi user đọc messages
     */
    @Modifying
    @Query("UPDATE ConversationParticipant cp SET cp.unreadCount = 0, cp.lastReadAt = :readAt WHERE cp.conversationId = :conversationId AND cp.userId = :userId")
    void markAsRead(UUID conversationId, UUID userId, LocalDateTime readAt);
    
    /**
     * Tăng unread count cho tất cả participants trừ sender
     */
    @Modifying
    @Query("UPDATE ConversationParticipant cp SET cp.unreadCount = cp.unreadCount + 1 WHERE cp.conversationId = :conversationId AND cp.userId != :senderId AND cp.leftAt IS NULL")
    void incrementUnreadForOthers(UUID conversationId, UUID senderId);
    
    /**
     * Lấy participants kèm user info
     */
    @Query("SELECT cp FROM ConversationParticipant cp JOIN FETCH cp.user WHERE cp.conversationId = :conversationId AND cp.leftAt IS NULL")
    List<ConversationParticipant> findParticipantsWithUser(UUID conversationId);
    
    /**
     * Update mute status cho user trong conversation
     */
    @Modifying
    @Query("UPDATE ConversationParticipant cp SET cp.isMuted = :muted WHERE cp.conversationId = :conversationId AND cp.userId = :userId")
    void updateMuteStatus(UUID conversationId, UUID userId, boolean muted);
}
