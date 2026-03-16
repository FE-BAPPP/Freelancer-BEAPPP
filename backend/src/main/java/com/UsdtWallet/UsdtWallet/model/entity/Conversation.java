package com.UsdtWallet.UsdtWallet.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Conversation Entity - Quản lý cuộc hội thoại (FR-11)
 * 
 * Types:
 * - Job conversation: Thương lượng trước khi award
 * - Project conversation: Workspace chat sau khi tạo project
 */
@Entity
@Table(name = "conversations", indexes = {
    @Index(name = "idx_conversations_job_id", columnList = "job_id"),
    @Index(name = "idx_conversations_project_id", columnList = "project_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Conversation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    // Liên kết với Job (thương lượng proposal)
    @Column(name = "job_id")
    private UUID jobId;

    // Liên kết với Project (workspace chat)
    @Column(name = "project_id")
    private UUID projectId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Cache tin nhắn cuối
    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    @Column(name = "last_message_preview", length = 200)
    private String lastMessagePreview;

    // Participants
    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ConversationParticipant> participants = new ArrayList<>();
}