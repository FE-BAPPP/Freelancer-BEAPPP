package com.UsdtWallet.UsdtWallet.service;

import com.UsdtWallet.UsdtWallet.model.dto.request.MessageSendRequest;
import com.UsdtWallet.UsdtWallet.model.dto.response.MessageResponse;
import com.UsdtWallet.UsdtWallet.model.entity.*;
import com.UsdtWallet.UsdtWallet.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    
    @Transactional
    public MessageResponse sendMessage(UUID senderId, MessageSendRequest request) {

        Conversation conversation = conversationRepository.findById(request.getConversationId())
            .orElseThrow(() -> new RuntimeException("Conversation not found"));

        validateUserInConversation(senderId, conversation);

        Message message = Message.builder()
            .conversationId(request.getConversationId())
            .senderId(senderId)
            .content(request.getContent())
            .messageType(request.getMessageType())
            .attachmentUrl(request.getAttachmentUrl())
            .isRead(false)
            .createdAt(LocalDateTime.now())
            .build();

        message = messageRepository.save(message);

        conversation.setLastMessageAt(message.getCreatedAt());
        conversation.setLastMessagePreview(
            message.getContent().length() > 100 
                ? message.getContent().substring(0, 100) + "..." 
                : message.getContent()
        );
        conversationRepository.save(conversation);

        User sender = userRepository.findById(senderId)
            .orElseThrow(() -> new RuntimeException("Sender not found"));

        MessageResponse response = MessageResponse.builder()
            .id(message.getId())
            .conversationId(message.getConversationId())
            .senderId(message.getSenderId())
            .senderName(sender.getFullName() != null ? sender.getFullName() : sender.getUsername())
            .content(message.getContent())
            .messageType(message.getMessageType())
            .attachmentUrl(message.getAttachmentUrl())
            .isRead(message.getIsRead())
            .createdAt(message.getCreatedAt())
            .build();

        sendRealTimeMessage(conversation, response);

        notifyOtherParty(conversation, senderId, sender.getFullName(), message.getContent());

        log.info("Message sent: {} in conversation: {}", message.getId(), conversation.getId());
        return response;
    }

    
    public Page<MessageResponse> getConversationMessages(UUID conversationId, UUID userId, int page, int size) {

        Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new RuntimeException("Conversation not found"));
        
        validateUserInConversation(userId, conversation);

        Pageable pageable = PageRequest.of(page, size);
        Page<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtDesc(
            conversationId, pageable);

        return messages.map(this::toMessageResponse);
    }

    
    public List<MessageResponse> getNewMessages(UUID conversationId, UUID userId, LocalDateTime since) {
        Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new RuntimeException("Conversation not found"));
        
        validateUserInConversation(userId, conversation);

        List<Message> newMessages = messageRepository.findByConversationIdAndCreatedAtAfterOrderByCreatedAtAsc(
            conversationId, since);

        return newMessages.stream()
            .map(this::toMessageResponse)
            .collect(Collectors.toList());
    }

    
    @Transactional
    public void markAsRead(UUID messageId, UUID userId) {
        Message message = messageRepository.findById(messageId)
            .orElseThrow(() -> new RuntimeException("Message not found"));

        if (!message.getSenderId().equals(userId) && !message.getIsRead()) {
            message.setIsRead(true);
            message.setReadAt(LocalDateTime.now());
            messageRepository.save(message);

            log.info("Message {} marked as read by user {}", messageId, userId);
        }
    }

    
    @Transactional
    public void markAllAsRead(UUID conversationId, UUID userId) {
        List<Message> unreadMessages = messageRepository.findUnreadMessages(conversationId, userId);
        
        LocalDateTime now = LocalDateTime.now();
        unreadMessages.forEach(msg -> {
            msg.setIsRead(true);
            msg.setReadAt(now);
        });
        
        messageRepository.saveAll(unreadMessages);
        log.info("Marked {} messages as read in conversation {}", unreadMessages.size(), conversationId);
    }

    
    public Long getUnreadCount(UUID conversationId, UUID userId) {
        return messageRepository.countUnreadMessages(conversationId, userId);
    }

    
    private void validateUserInConversation(UUID userId, Conversation conversation) {
        if (conversation.getProjectId() != null) {
            Project project = projectRepository.findById(conversation.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

            if (!project.getEmployerId().equals(userId) && 
                !project.getFreelancerId().equals(userId)) {
                throw new RuntimeException("User not authorized to access this conversation");
            }
        }

    }

    
    private void sendRealTimeMessage(Conversation conversation, MessageResponse message) {
        try {

            messagingTemplate.convertAndSend(
                "/topic/conversation/" + conversation.getId(), 
                message
            );
            log.debug("Real-time message sent to WebSocket: {}", conversation.getId());
        } catch (Exception e) {
            log.error("Failed to send WebSocket message", e);
        }
    }

    
    private void notifyOtherParty(Conversation conversation, UUID senderId, 
                                 String senderName, String messageContent) {
        try {
            if (conversation.getProjectId() != null) {
                Project project = projectRepository.findById(conversation.getProjectId())
                    .orElse(null);
                
                if (project != null) {
                    UUID recipientId = project.getEmployerId().equals(senderId) 
                        ? project.getFreelancerId() 
                        : project.getEmployerId();

                    String preview = messageContent.length() > 50 
                        ? messageContent.substring(0, 50) + "..." 
                        : messageContent;

                    notificationService.notifyNewMessage(
                        recipientId, 
                        conversation.getId(), 
                        senderName, 
                        preview
                    );
                }
            }
        } catch (Exception e) {
            log.error("Failed to send notification", e);
        }
    }

    
    private MessageResponse toMessageResponse(Message message) {
        User sender = userRepository.findById(message.getSenderId()).orElse(null);
        
        return MessageResponse.builder()
            .id(message.getId())
            .conversationId(message.getConversationId())
            .senderId(message.getSenderId())
            .senderName(sender != null 
                ? (sender.getFullName() != null ? sender.getFullName() : sender.getUsername())
                : "Unknown")
            .content(message.getContent())
            .messageType(message.getMessageType())
            .attachmentUrl(message.getAttachmentUrl())
            .isRead(message.getIsRead())
            .createdAt(message.getCreatedAt())
            .readAt(message.getReadAt())
            .build();
    }

    
    public List<Conversation> getUserConversations(UUID userId) {
        return conversationRepository.findUserConversations(userId);
    }
}