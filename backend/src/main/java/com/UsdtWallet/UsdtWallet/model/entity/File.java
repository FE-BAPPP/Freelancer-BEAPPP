package com.UsdtWallet.UsdtWallet.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * File Entity - Quản lý file upload
 * 
 * Gắn với các entity: Job, Proposal, Project, Milestone, Conversation
 */
@Entity
@Table(name = "files", indexes = {
    @Index(name = "idx_files_entity", columnList = "entity_type, entity_id"),
    @Index(name = "idx_files_uploaded_by", columnList = "uploaded_by")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class File {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(name = "uploaded_by", nullable = false)
    private UUID uploadedBy;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", nullable = false, length = 20)
    private FileEntityType entityType;
    
    @Column(name = "entity_id", nullable = false)
    private UUID entityId;
    
    @Column(name = "file_url", nullable = false, length = 500)
    private String fileUrl;
    
    @Column(name = "file_name", length = 255)
    private String fileName;
    
    @Column(name = "file_size")
    private Long fileSize;
    
    @Column(name = "mime_type", length = 100)
    private String mimeType;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    public enum FileEntityType {
        JOB,            // File đính kèm job description
        PROPOSAL,       // File trong proposal
        PROJECT,        // Tài liệu project
        MILESTONE,      // Deliverables
        CONVERSATION    // File trong chat
    }
}
