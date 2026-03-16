package com.UsdtWallet.UsdtWallet.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.UsdtWallet.UsdtWallet.model.entity.Notification;
import com.UsdtWallet.UsdtWallet.model.entity.User;
import com.UsdtWallet.UsdtWallet.repository.NotificationRepository;
import com.UsdtWallet.UsdtWallet.repository.UserRepository;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final ObjectMapper objectMapper;
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final UserRepository userRepository;
    
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    
    public void sendToUser(UUID userId, NotificationMessage message) {
        try {

            userRepository.findById(userId).ifPresent(user -> {

                messagingTemplate.convertAndSendToUser(
                    user.getUsername(), 
                    "/queue/notifications",
                    message
                );
                log.debug("Sent WS notification to user {} ({}): {}", userId, user.getUsername(), message.getTitle());
            });
        } catch (Exception e) {
            log.warn("Failed to send WS notification to user: {}", userId, e);
        }
    }

    
    
    @Transactional
    public Notification createNotification(
            UUID userId,
            Notification.NotificationType type,
            String title,
            String message,
            String entityType,
            UUID entityId) {
        
        Notification notification = Notification.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .message(message)
                .entityType(entityType)
                .entityId(entityId)
                .isRead(false)
                .build();
        
        notification = notificationRepository.save(notification);

        sendToUser(userId, convertToMessage(notification));
        
        log.info("Created notification: {} for user: {}", type, userId);
        return notification;
    }
    
    
    public Page<Notification> getUserNotifications(UUID userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }
    
    
    public Long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
    
    
    @Transactional
    public void markAsRead(UUID notificationId, UUID userId) {
        notificationRepository.findByIdAndUserId(notificationId, userId)
                .ifPresent(notification -> {
                    notification.setIsRead(true);
                    notification.setReadAt(LocalDateTime.now());
                    notificationRepository.save(notification);
                });
    }
    
    
    @Transactional
    public void markAllAsRead(UUID userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalse(userId);
        unread.forEach(notification -> {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
        });
        notificationRepository.saveAll(unread);
    }


    public void notifyDepositDetected(UUID userId, String txHash, BigDecimal amount) {
        sendToUser(userId, NotificationMessage.builder()
            .type(NotificationType.DEPOSIT_DETECTED)
            .title("Đã phát hiện nạp tiền")
            .message(String.format("Đã phát hiện %.2f USDT", amount))
            .txHash(txHash)
            .amount(amount)
            .timestamp(LocalDateTime.now())
            .autoHide(true)
            .hideAfterMs(12000)
            .build());
    }

    public void notifyDepositConfirmed(UUID userId, String txHash, BigDecimal amount, BigDecimal pointsCredited) {

        sendToUser(userId, NotificationMessage.builder()
            .type(NotificationType.DEPOSIT_CONFIRMED)
            .title("Đã xác nhận nạp tiền")
            .message(String.format("Đã xác nhận %.2f USDT, đã cộng %.2f điểm", amount, pointsCredited))
            .txHash(txHash)
            .amount(amount)
            .pointsAmount(pointsCredited)
            .timestamp(LocalDateTime.now())
            .autoHide(true)
            .hideAfterMs(10000)
            .build());

        createNotification(
            userId,
            Notification.NotificationType.DEPOSIT_SUCCESS,
            "Đã xác nhận nạp tiền",
            String.format("Đã xác nhận %.2f USDT và cộng vào tài khoản của bạn", pointsCredited),
            "PAYMENT",
            null
        );

        try {
            userRepository.findById(userId).ifPresent(user -> {
                if (user.getEmail() != null && !user.getEmail().isEmpty()) {
                    emailService.sendDepositConfirmedEmail(user.getEmail(), amount.toString(), txHash);
                }
            });
        } catch (Exception e) {
            log.warn("Failed to send deposit email notification: {}", e.getMessage());
        }
    }

    public void notifyWithdrawalCreated(UUID userId, String withdrawalId, BigDecimal amount) {
        sendToUser(userId, NotificationMessage.builder()
            .type(NotificationType.WITHDRAWAL_CREATED)
            .title("Đã tạo yêu cầu rút tiền")
            .message(String.format("Đã tạo yêu cầu rút %.2f USDT", amount))
            .withdrawalId(withdrawalId)
            .amount(amount)
            .timestamp(LocalDateTime.now())
            .autoHide(true)
            .hideAfterMs(5000)
            .build());
    }

    public void notifyWithdrawalProcessing(UUID userId, String withdrawalId, String txHash, BigDecimal amount) {
        sendToUser(userId, NotificationMessage.builder()
            .type(NotificationType.WITHDRAWAL_PROCESSING)
            .title("Đang xử lý rút tiền")
            .message(String.format("Đang xử lý yêu cầu rút %.2f USDT của bạn", amount))
            .txHash(txHash)
            .withdrawalId(withdrawalId)
            .amount(amount)
            .timestamp(LocalDateTime.now())
            .autoHide(true)
            .hideAfterMs(15000)
            .build());
    }

    public void notifyWithdrawalCompleted(UUID userId, String txHash, BigDecimal amount) {

        sendToUser(userId, NotificationMessage.builder()
            .type(NotificationType.WITHDRAWAL_COMPLETED)
            .title("Đã hoàn tất rút tiền")
            .message(String.format("Đã rút thành công %.2f USDT", amount))
            .txHash(txHash)
            .amount(amount)
            .timestamp(LocalDateTime.now())
            .autoHide(true)
            .hideAfterMs(10000)
            .build());

        createNotification(
            userId,
            Notification.NotificationType.WITHDRAWAL_SUCCESS,
            "Đã hoàn tất rút tiền",
            String.format("Đã rút thành công %.2f USDT", amount),
            "PAYMENT",
            null
        );

        try {
            userRepository.findById(userId).ifPresent(user -> {
                if (user.getEmail() != null && !user.getEmail().isEmpty()) {
                    emailService.sendWithdrawalProcessedEmail(user.getEmail(), amount.toString(), "External Wallet", txHash);
                }
            });
        } catch (Exception e) {
            log.warn("Failed to send withdrawal email notification: {}", e.getMessage());
        }
    }

    public void notifyPointsTransferred(UUID userId, BigDecimal amount, String fromTo, boolean isReceived) {
        String action = isReceived ? "nhận từ" : "gửi đến";
        sendToUser(userId, NotificationMessage.builder()
            .type(NotificationType.POINTS_TRANSFER)
            .title("Chuyển điểm")
            .message(String.format("%.2f điểm %s %s", amount, action, fromTo))
            .pointsAmount(amount)
            .timestamp(LocalDateTime.now())
            .autoHide(true)
            .hideAfterMs(7000)
            .build());
    }

    public void notifyBalanceUpdate(UUID userId, BigDecimal newBalance) {
        sendToUser(userId, NotificationMessage.builder()
            .type(NotificationType.BALANCE_UPDATE)
            .title("Đã cập nhật số dư")
            .message("Số dư của bạn đã được cập nhật")
            .pointsBalance(newBalance)
            .timestamp(LocalDateTime.now())
            .autoHide(true)
            .hideAfterMs(3000)
            .build());
    }

    
    public void notifyJobPosted(UUID employerId, UUID jobId, String jobTitle) {
        createNotification(
            employerId,
            Notification.NotificationType.JOB_POSTED,
            "Đã đăng công việc thành công",
            String.format("Công việc '%s' đã được đăng và hiển thị cho freelancer", jobTitle),
            "JOB",
            jobId
        );
    }
    
    public void notifyProposalReceived(UUID employerId, UUID jobId, String freelancerName, String jobTitle) {
        createNotification(
            employerId,
            Notification.NotificationType.PROPOSAL_RECEIVED,
            "Đã nhận đề xuất mới",
            String.format("%s đã gửi đề xuất cho '%s'", freelancerName, jobTitle),
            "JOB",
            jobId
        );
    }
    
    public void notifyProposalAccepted(UUID freelancerId, UUID projectId, String jobTitle) {
        createNotification(
            freelancerId,
            Notification.NotificationType.PROPOSAL_ACCEPTED,
            "Đề xuất đã được chấp nhận! 🎉",
            String.format("Chúc mừng! Đề xuất của bạn cho '%s' đã được chấp nhận", jobTitle),
            "PROJECT",
            projectId
        );
    }
    
    public void notifyProposalRejected(UUID freelancerId, UUID jobId, String jobTitle) {
        createNotification(
            freelancerId,
            Notification.NotificationType.PROPOSAL_REJECTED,
            "Cập nhật trạng thái đề xuất",
            String.format("Đề xuất của bạn cho công việc '%s' đã không được chọn lần này.", jobTitle),
            "JOB",
            jobId
        );
    }

    
    public void notifyProjectStarted(UUID freelancerId, UUID employerId, UUID projectId, String projectTitle) {

        createNotification(
            freelancerId,
            Notification.NotificationType.PROJECT_STARTED,
            "Dự án đã bắt đầu",
            String.format("Dự án '%s' đã bắt đầu. Chúc bạn thành công!", projectTitle),
            "PROJECT",
            projectId
        );

        createNotification(
            employerId,
            Notification.NotificationType.PROJECT_STARTED,
            "Dự án đã bắt đầu",
            String.format("Dự án '%s' đã bắt đầu với freelancer đã chọn", projectTitle),
            "PROJECT",
            projectId
        );
    }
    
    public void notifyMilestoneCreated(UUID freelancerId, UUID milestoneId, String milestoneTitle, BigDecimal amount) {
        createNotification(
            freelancerId,
            Notification.NotificationType.MILESTONE_CREATED,
            "Đã tạo giai đoạn mới",
            String.format("Giai đoạn '%s' (%.2f USDT) đã được tạo", milestoneTitle, amount),
            "MILESTONE",
            milestoneId
        );
    }
    
    public void notifyMilestoneFunded(UUID freelancerId, UUID milestoneId, String milestoneTitle, BigDecimal amount) {
        createNotification(
            freelancerId,
            Notification.NotificationType.MILESTONE_CREATED,
            "Giai đoạn đã được nạp tiền",
            String.format("Giai đoạn '%s' đã được nạp %.2f USDT vào hệ thống ký quỹ.", milestoneTitle, amount),
            "MILESTONE",
            milestoneId
        );
    }
    
    public void notifyMilestoneSubmitted(UUID employerId, UUID milestoneId, String milestoneTitle) {
        createNotification(
            employerId,
            Notification.NotificationType.MILESTONE_SUBMITTED,
            "Đã nộp giai đoạn để kiểm duyệt",
            String.format("Giai đoạn '%s' đã được nộp và chờ bạn phê duyệt", milestoneTitle),
            "MILESTONE",
            milestoneId
        );
    }
    
    public void notifyMilestoneApproved(UUID freelancerId, UUID milestoneId, String milestoneTitle, BigDecimal amount) {
        createNotification(
            freelancerId,
            Notification.NotificationType.MILESTONE_APPROVED,
            "Đã phê duyệt giai đoạn! 🎉",
            String.format("Giai đoạn '%s' đã được phê duyệt! %.2f USDT đã được chuyển vào tài khoản của bạn", 
                milestoneTitle, amount),
            "MILESTONE",
            milestoneId
        );

        try {
            userRepository.findById(freelancerId).ifPresent(user -> {
                if (user.getEmail() != null && !user.getEmail().isEmpty()) {
                    emailService.sendMilestonePaymentEmail(user.getEmail(), "Project", milestoneTitle, amount.toString());
                }
            });
        } catch (Exception e) {
            log.warn("Failed to send milestone payment email notification: {}", e.getMessage());
        }
    }
    
    public void notifyMilestoneRejected(UUID freelancerId, UUID milestoneId, String milestoneTitle, String reason) {
        createNotification(
            freelancerId,
            Notification.NotificationType.MILESTONE_REJECTED,
            "Giai đoạn cần chỉnh sửa",
            String.format("Giai đoạn '%s' cần chỉnh sửa. Lý do: %s", milestoneTitle, reason),
            "MILESTONE",
            milestoneId
        );
    }

    
    public void notifyPaymentReceived(UUID userId, BigDecimal amount, String from, String description) {
        createNotification(
            userId,
            Notification.NotificationType.PAYMENT_RECEIVED,
            "Đã nhận thanh toán",
            String.format("Bạn đã nhận %.2f USDT từ %s. %s", amount, from, description),
            "PAYMENT",
            null
        );
    }
    
    public void notifyPaymentSent(UUID userId, BigDecimal amount, String to, String description) {
        createNotification(
            userId,
            Notification.NotificationType.PAYMENT_SENT,
            "Đã gửi thanh toán",
            String.format("Bạn đã gửi %.2f USDT đến %s. %s", amount, to, description),
            "PAYMENT",
            null
        );
    }

    
    public void notifyDisputeOpened(UUID userId, UUID disputeId, String projectTitle) {
        createNotification(
            userId,
            Notification.NotificationType.DISPUTE_OPENED,
            "Đã mở tranh chấp",
            String.format("Một tranh chấp đã được mở cho dự án '%s'. Quản trị viên sẽ kiểm tra sớm.", 
                projectTitle),
            "DISPUTE",
            disputeId
        );
    }
    
    public void notifyDisputeResolved(UUID userId, UUID disputeId, String resolution) {
        createNotification(
            userId,
            Notification.NotificationType.DISPUTE_RESOLVED,
            "Đã giải quyết tranh chấp",
            String.format("Tranh chấp đã được giải quyết. Giải pháp: %s", resolution),
            "DISPUTE",
            disputeId
        );
    }

    
    
    public void notifyNewMessage(UUID userId, UUID conversationId, String senderName, String preview) {
        createNotification(
            userId,
            Notification.NotificationType.MESSAGE_RECEIVED,
            "Tin nhắn mới từ " + senderName,
            preview,
            "CONVERSATION",
            conversationId
        );

        sendToUser(userId, NotificationMessage.builder()
            .type(NotificationType.MESSAGE)
            .title("Tin nhắn mới")
            .message(senderName + ": " + preview)
            .entityId(conversationId.toString())
            .timestamp(LocalDateTime.now())
            .build());
    }

    
    
    private NotificationMessage convertToMessage(Notification notification) {
        return NotificationMessage.builder()
            .type(mapToSseType(notification.getType()))
            .title(notification.getTitle())
            .message(notification.getMessage())
            .timestamp(notification.getCreatedAt())
            .autoHide(true)
            .hideAfterMs(8000)
            .build();
    }
    
    
    private NotificationType mapToSseType(Notification.NotificationType dbType) {
        return switch (dbType) {
            case DEPOSIT_SUCCESS -> NotificationType.DEPOSIT_CONFIRMED;
            case WITHDRAWAL_SUCCESS -> NotificationType.WITHDRAWAL_COMPLETED;
            case WITHDRAWAL_PENDING -> NotificationType.WITHDRAWAL_PROCESSING;
            default -> NotificationType.SYSTEM;
        };
    }


    public static class NotificationMessage {
        private NotificationType type;
        private String title;
        private String message;
        private String entityId;
        private String txHash;
        private String withdrawalId;
        private BigDecimal amount;
        private BigDecimal pointsAmount;
        private BigDecimal pointsBalance;
        private LocalDateTime timestamp;
        private boolean autoHide = true;
        private long hideAfterMs = 5000;

        public static NotificationMessageBuilder builder() {
            return new NotificationMessageBuilder();
        }

        public NotificationType getType() { return type; }
        public void setType(NotificationType type) { this.type = type; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getEntityId() { return entityId; }
        public void setEntityId(String entityId) { this.entityId = entityId; }
        public String getTxHash() { return txHash; }
        public void setTxHash(String txHash) { this.txHash = txHash; }
        public String getWithdrawalId() { return withdrawalId; }
        public void setWithdrawalId(String withdrawalId) { this.withdrawalId = withdrawalId; }
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        public BigDecimal getPointsAmount() { return pointsAmount; }
        public void setPointsAmount(BigDecimal pointsAmount) { this.pointsAmount = pointsAmount; }
        public BigDecimal getPointsBalance() { return pointsBalance; }
        public void setPointsBalance(BigDecimal pointsBalance) { this.pointsBalance = pointsBalance; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
        public boolean isAutoHide() { return autoHide; }
        public void setAutoHide(boolean autoHide) { this.autoHide = autoHide; }
        public long getHideAfterMs() { return hideAfterMs; }
        public void setHideAfterMs(long hideAfterMs) { this.hideAfterMs = hideAfterMs; }
    }

    public static class NotificationMessageBuilder {
        private final NotificationMessage message = new NotificationMessage();

        public NotificationMessageBuilder type(NotificationType type) {
            message.setType(type);
            return this;
        }

        public NotificationMessageBuilder entityId(String entityId) {
            message.setEntityId(entityId);
            return this;
        }

        public NotificationMessageBuilder title(String title) {
            message.setTitle(title);
            return this;
        }

        public NotificationMessageBuilder message(String msg) {
            message.setMessage(msg);
            return this;
        }

        public NotificationMessageBuilder txHash(String txHash) {
            message.setTxHash(txHash);
            return this;
        }

        public NotificationMessageBuilder withdrawalId(String withdrawalId) {
            message.setWithdrawalId(withdrawalId);
            return this;
        }

        public NotificationMessageBuilder amount(BigDecimal amount) {
            message.setAmount(amount);
            return this;
        }

        public NotificationMessageBuilder pointsAmount(BigDecimal pointsAmount) {
            message.setPointsAmount(pointsAmount);
            return this;
        }

        public NotificationMessageBuilder pointsBalance(BigDecimal pointsBalance) {
            message.setPointsBalance(pointsBalance);
            return this;
        }

        public NotificationMessageBuilder timestamp(LocalDateTime timestamp) {
            message.setTimestamp(timestamp);
            return this;
        }

        public NotificationMessageBuilder autoHide(boolean autoHide) {
            message.setAutoHide(autoHide);
            return this;
        }

        public NotificationMessageBuilder hideAfterMs(long hideAfterMs) {
            message.setHideAfterMs(hideAfterMs);
            return this;
        }

        public NotificationMessage build() {
            return message;
        }
    }

    public enum NotificationType {
        SYSTEM,
        DEPOSIT_DETECTED,
        DEPOSIT_CONFIRMED,
        WITHDRAWAL_CREATED,
        WITHDRAWAL_PROCESSING,
        WITHDRAWAL_COMPLETED,
        WITHDRAWAL_FAILED,
        POINTS_TRANSFER,
        BALANCE_UPDATE,
        MESSAGE 
    }
}