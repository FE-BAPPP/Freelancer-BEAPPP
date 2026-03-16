package com.UsdtWallet.UsdtWallet.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * ConversationParticipant Entity - Bảng trung gian cho conversations
 * 
 * Quản lý ai đang tham gia cuộc hội thoại nào
 * - Employer và Freelancer đều có thể là participants
 * - Có thể mở rộng thêm role (ADMIN moderator) nếu cần
 */
@Entity
@Table(name = "conversation_participants", 
    uniqueConstraints = @UniqueConstraint(
        name = "uq_conversation_user",
        columnNames = {"conversation_id", "user_id"}
    ),
    indexes = {
        @Index(name = "idx_conv_participants_user", columnList = "user_id"),
        @Index(name = "idx_conv_participants_conv", columnList = "conversation_id")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "conversation_id", nullable = false)
    private UUID conversationId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", length = 20)
    @Builder.Default
    private ParticipantRole role = ParticipantRole.MEMBER;

    @Column(name = "last_read_at")
    private LocalDateTime lastReadAt;

    @Column(name = "unread_count")
    @Builder.Default
    private Integer unreadCount = 0;

    @Column(name = "is_muted")
    @Builder.Default
    private Boolean isMuted = false;

    @CreationTimestamp
    @Column(name = "joined_at", updatable = false)
    private LocalDateTime joinedAt;

    @Column(name = "left_at")
    private LocalDateTime leftAt;

    // Relationships - JsonIgnore to prevent circular reference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", insertable = false, updatable = false)
    @JsonIgnore
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    @JsonIgnore
    private User user;

    public enum ParticipantRole {
        EMPLOYER,       // Chủ dự án
        FREELANCER,     // Freelancer thực hiện
        MEMBER,         // Thành viên chung
        ADMIN           // Admin can thiệp (nếu có dispute)
    }
}
