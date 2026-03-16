package com.UsdtWallet.UsdtWallet.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Message Entity - Tin nhắn trong conversation (FR-11)
 * 
 * Hỗ trợ: Text, File, Image
 */
@Entity
@Table(name = "messages", indexes = {
    @Index(name = "idx_messages_conversation_id", columnList = "conversation_id, created_at")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "conversation_id", nullable = false)
    private UUID conversationId;

    @Column(name = "sender_id", nullable = false)
    private UUID senderId;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "message_type", length = 20)
    @Builder.Default
    private MessageType messageType = MessageType.TEXT;

    // File attachment (nếu có)
    @Column(name = "attachment_url", length = 500)
    private String attachmentUrl;

    // Đánh dấu đã đọc
    @Column(name = "is_read")
    @Builder.Default
    private Boolean isRead = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum MessageType {
        TEXT,       // Tin nhắn văn bản
        FILE,       // File attachment
        IMAGE       // Hình ảnh
    }
}