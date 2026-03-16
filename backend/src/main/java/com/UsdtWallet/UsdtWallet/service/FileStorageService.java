package com.UsdtWallet.UsdtWallet.service;

import com.UsdtWallet.UsdtWallet.model.entity.File;
import com.UsdtWallet.UsdtWallet.model.entity.User;
import com.UsdtWallet.UsdtWallet.model.dto.response.FileResponse;
import com.UsdtWallet.UsdtWallet.repository.FileRepository;
import com.UsdtWallet.UsdtWallet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileStorageService {
    
    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    
    @Value("${file.upload.dir:uploads}")
    private String uploadDir;
    
    @Value("${file.max.size:10485760}") 
    private long maxFileSize;
    
    private static final List<String> ALLOWED_MIME_TYPES = List.of(
        "image/jpeg", "image/png", "image/gif", "image/webp",
        "application/pdf",
        "application/zip", "application/x-zip-compressed",
        "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain"
    );
    
    
    @Transactional
    public FileResponse uploadFile(
        MultipartFile file, 
        UUID uploaderId, 
        File.FileEntityType entityType, 
        UUID entityId
    ) throws IOException {

        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload empty file");
        }
        
        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException("File size exceeds maximum limit of " + (maxFileSize / 1024 / 1024) + "MB");
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("File type not allowed: " + contentType);
        }

        String originalFilename = file.getOriginalFilename();


        try {
            if (originalFilename != null && !originalFilename.isEmpty()) {

                 String redecoded = new String(originalFilename.getBytes(java.nio.charset.StandardCharsets.ISO_8859_1), java.nio.charset.StandardCharsets.UTF_8);


                 originalFilename = redecoded;
            }
        } catch (Exception e) {
            log.warn("Failed to fix filename encoding", e);
        }

        String extension = originalFilename != null && originalFilename.contains(".") 
            ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
            : "";
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uniqueFilename = UUID.randomUUID().toString() + "_" + timestamp + extension;

        Path entityDir = Paths.get(uploadDir, entityType.name().toLowerCase(), entityId.toString());
        Files.createDirectories(entityDir);

        Path filePath = entityDir.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        log.info("File uploaded: {}", filePath.toString());
        
        String fileUrl = "/api/files/download/" + entityType.name().toLowerCase() + "/" + entityId + "/" + uniqueFilename;
        
        File fileEntity = File.builder()
            .uploadedBy(uploaderId)
            .entityType(entityType)
            .entityId(entityId)
            .fileUrl(fileUrl)
            .fileName(originalFilename)
            .fileSize(file.getSize())
            .mimeType(contentType)
            .build();
        
        fileEntity = fileRepository.save(fileEntity);
        
        return convertToResponse(fileEntity);
    }
    
    
    public List<FileResponse> getFilesByEntity(File.FileEntityType entityType, UUID entityId) {
        List<File> files = fileRepository.findByEntityTypeAndEntityId(entityType, entityId);
        return files.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    
    public File getFileById(UUID fileId) {
        return fileRepository.findById(fileId)
            .orElseThrow(() -> new IllegalArgumentException("File not found: " + fileId));
    }
    
    
    @Transactional
    public void deleteFile(UUID fileId, UUID requesterId) throws IOException {
        File file = getFileById(fileId);

        if (!file.getUploadedBy().equals(requesterId)) {
            User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
            if (!requester.isAdmin()) {
                throw new IllegalArgumentException("Not authorized to delete this file");
            }
        }

        String fileUrl = file.getFileUrl();
        String[] parts = fileUrl.split("/");
        if (parts.length >= 6) {
            String entityType = parts[4];
            String entityId = parts[5];
            String filename = parts[6];
            
            Path filePath = Paths.get(uploadDir, entityType, entityId, filename);
            Files.deleteIfExists(filePath);
            log.info("Deleted file from disk: {}", filePath);
        }
        
        fileRepository.delete(file);
    }
    
    
    public Path getFilePath(String entityType, String entityId, String filename) {
        return Paths.get(uploadDir, entityType, entityId, filename);
    }
    
    
    private FileResponse convertToResponse(File file) {
        User uploader = userRepository.findById(file.getUploadedBy()).orElse(null);
        
        return FileResponse.builder()
            .id(file.getId())
            .uploadedBy(file.getUploadedBy())
            .uploaderName(uploader != null ? uploader.getFullName() : "Unknown")
            .entityType(file.getEntityType().name())
            .entityId(file.getEntityId())
            .fileUrl(file.getFileUrl())
            .fileName(file.getFileName())
            .fileSize(file.getFileSize())
            .mimeType(file.getMimeType())
            .createdAt(file.getCreatedAt())
            .build();
    }
}
