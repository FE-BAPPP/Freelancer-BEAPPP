package com.UsdtWallet.UsdtWallet.service;

import com.UsdtWallet.UsdtWallet.model.entity.WithdrawalTransaction;
import com.UsdtWallet.UsdtWallet.repository.WithdrawalTransactionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class WithdrawalQueueService {

    private final WithdrawalTransactionRepository withdrawalRepository;
    private final WithdrawalProcessorService withdrawalProcessorService;
    private final RedisTemplate<String, Object> redisTemplate;
    private final RedisTemplate<String, String> customStringRedisTemplate;

    public WithdrawalQueueService(
            WithdrawalTransactionRepository withdrawalRepository,
            WithdrawalProcessorService withdrawalProcessorService,
            RedisTemplate<String, Object> redisTemplate,
            @Qualifier("customStringRedisTemplate") RedisTemplate<String, String> customStringRedisTemplate) {
        this.withdrawalRepository = withdrawalRepository;
        this.withdrawalProcessorService = withdrawalProcessorService;
        this.redisTemplate = redisTemplate;
        this.customStringRedisTemplate = customStringRedisTemplate;
    }

    private static final String WITHDRAWAL_QUEUE_KEY = "withdrawal:queue";
    private static final String WITHDRAWAL_PROCESSING_KEY = "withdrawal:processing";

    
    public void addToQueue(Long withdrawalId) {
        try {
            customStringRedisTemplate.opsForList().rightPush(WITHDRAWAL_QUEUE_KEY, withdrawalId.toString());
            log.info("Added withdrawal {} to queue", withdrawalId);
        } catch (Exception e) {
            log.error("Failed to add withdrawal {} to queue", withdrawalId, e);
        }
    }

    
    public void removeFromQueues(Long withdrawalId) {
        try {
            String idStr = withdrawalId.toString();
            Long removedDelayed = redisTemplate.opsForZSet().remove("withdrawal:delayed", idStr);
            Long removedMain = customStringRedisTemplate.opsForList().remove(WITHDRAWAL_QUEUE_KEY, 0, idStr);
            log.info("Removed withdrawal {} from queues. delayedRemoved={}, mainRemoved={}", withdrawalId, removedDelayed, removedMain);
        } catch (Exception e) {
            log.error("Failed to remove withdrawal {} from queues", withdrawalId, e);
        }
    }

    
    @Scheduled(fixedDelay = 30000)
    @Async
    public void processQueue() {
        try {
            String withdrawalIdStr = customStringRedisTemplate.opsForList().leftPop(WITHDRAWAL_QUEUE_KEY);

            if (withdrawalIdStr != null) {
                Long withdrawalId = Long.parseLong(withdrawalIdStr);
                processWithdrawal(withdrawalId);
            }
        } catch (Exception e) {
            log.error("Error processing withdrawal queue", e);
        }
    }

    
    @Transactional
    public void processWithdrawal(Long withdrawalId) {
        try {
            log.info("Processing withdrawal: {}", withdrawalId);

            redisTemplate.opsForValue().set(
                WITHDRAWAL_PROCESSING_KEY + ":" + withdrawalId,
                "true",
                10,
                TimeUnit.MINUTES
            );

            WithdrawalTransaction withdrawal = withdrawalRepository.findById(withdrawalId)
                .orElseThrow(() -> new RuntimeException("Withdrawal not found: " + withdrawalId));

            if (withdrawal.getStatus() != WithdrawalTransaction.WithdrawalStatus.PENDING) {
                log.warn("Withdrawal {} is not in PENDING status: {}", withdrawalId, withdrawal.getStatus());
                return;
            }

            withdrawal.setStatus(WithdrawalTransaction.WithdrawalStatus.PROCESSING);
            withdrawalRepository.save(withdrawal);

            withdrawalProcessorService.processWithdrawal(withdrawal);

        } catch (Exception e) {
            log.error("Error processing withdrawal {}", withdrawalId, e);
            handleWithdrawalFailure(withdrawalId, e.getMessage());
        } finally {
            redisTemplate.delete(WITHDRAWAL_PROCESSING_KEY + ":" + withdrawalId);
        }
    }

    
    @Transactional
    public void handleWithdrawalFailure(Long withdrawalId, String errorMessage) {
        try {
            WithdrawalTransaction withdrawal = withdrawalRepository.findById(withdrawalId).orElse(null);
            if (withdrawal == null) return;

            withdrawal.incrementRetry();
            withdrawal.setFailureReason(errorMessage);

            if (withdrawal.canBeRetried()) {
                log.info("Retrying withdrawal {} (attempt {}/{})",
                    withdrawalId, withdrawal.getRetryCount(), withdrawal.getMaxRetries());

                withdrawal.setStatus(WithdrawalTransaction.WithdrawalStatus.PENDING);
                withdrawalRepository.save(withdrawal);

                addToQueueWithDelay(withdrawalId, 60); 
            } else {
                log.error("Withdrawal {} failed permanently after {} retries",
                    withdrawalId, withdrawal.getRetryCount());

                withdrawal.setStatus(WithdrawalTransaction.WithdrawalStatus.FAILED);
                withdrawalRepository.save(withdrawal);
            }

        } catch (Exception e) {
            log.error("Error handling withdrawal failure for {}", withdrawalId, e);
        }
    }

    
    public void addToQueueWithDelay(Long withdrawalId, int delaySeconds) {
        long score = System.currentTimeMillis() + (delaySeconds * 1000L);
        redisTemplate.opsForZSet().add("withdrawal:delayed", withdrawalId.toString(), score);
    }

    
    @Scheduled(fixedDelay = 60000)
    @Async
    public void processDelayedQueue() {
        try {
            long currentTime = System.currentTimeMillis();
            var delayedWithdrawals = redisTemplate.opsForZSet()
                .rangeByScore("withdrawal:delayed", 0, currentTime);

            if (delayedWithdrawals != null && !delayedWithdrawals.isEmpty()) {
                for (Object withdrawalIdObj : delayedWithdrawals) {
                    String withdrawalIdStr = withdrawalIdObj.toString();

                    redisTemplate.opsForZSet().remove("withdrawal:delayed", withdrawalIdStr);

                    customStringRedisTemplate.opsForList().rightPush(WITHDRAWAL_QUEUE_KEY, withdrawalIdStr);

                    log.info("Moved delayed withdrawal {} to main queue", withdrawalIdStr);
                }
            }
        } catch (Exception e) {
            log.error("Error processing delayed withdrawal queue", e);
        }
    }

    
    public java.util.Map<String, Object> getQueueStats() {
        try {
            Long queueSize = customStringRedisTemplate.opsForList().size(WITHDRAWAL_QUEUE_KEY);
            Long delayedSize = redisTemplate.opsForZSet().zCard("withdrawal:delayed");

            var processingKeys = redisTemplate.keys(WITHDRAWAL_PROCESSING_KEY + ":*");
            int processingCount = processingKeys != null ? processingKeys.size() : 0;

            return java.util.Map.of(
                "queueSize", queueSize != null ? queueSize : 0,
                "delayedSize", delayedSize != null ? delayedSize : 0,
                "processingCount", processingCount,
                "timestamp", LocalDateTime.now()
            );
        } catch (Exception e) {
            log.error("Error getting queue stats", e);
            return java.util.Map.of("error", "Failed to get stats");
        }
    }

    
    @Scheduled(fixedDelay = 3600000)
    @Async
    public void retryFailedWithdrawals() {
        try {

            List<WithdrawalTransaction> failedWithdrawals = withdrawalRepository
                .findFailedWithdrawalsForRetry(LocalDateTime.now().minusHours(1));

            for (WithdrawalTransaction withdrawal : failedWithdrawals) {
                if (withdrawal.canBeRetried()) {
                    log.info("Auto-retrying failed withdrawal: {}", withdrawal.getId());
                    withdrawal.setStatus(WithdrawalTransaction.WithdrawalStatus.PENDING);
                    withdrawalRepository.save(withdrawal);
                    addToQueue(withdrawal.getId());
                }
            }

            if (!failedWithdrawals.isEmpty()) {
                log.info("Auto-retried {} failed withdrawals", failedWithdrawals.size());
            }

        } catch (Exception e) {
            log.error("Error retrying failed withdrawals", e);
        }
    }
}
