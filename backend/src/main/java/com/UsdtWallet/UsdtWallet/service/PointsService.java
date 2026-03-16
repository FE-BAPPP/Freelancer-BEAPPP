package com.UsdtWallet.UsdtWallet.service;

import com.UsdtWallet.UsdtWallet.model.entity.PointsLedger;
import com.UsdtWallet.UsdtWallet.repository.PointsLedgerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class PointsService {

    private final PointsLedgerRepository pointsLedgerRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final NotificationService notificationService;

    @Value("${points.exchange.rate:1.0}")
    private BigDecimal defaultExchangeRate; 

    @Value("${points.transfer.fee:0}")
    private BigDecimal transferFeeRate; 

    private static final String BALANCE_CACHE_KEY = "user:balance:";

    
    @Transactional
    public boolean creditPointsForDeposit(UUID userId, BigDecimal pointsAmount,
                                        String transactionId, BigDecimal usdtAmount) {
        try {
            if (pointsLedgerRepository.existsByTransactionId(transactionId)) {
                log.warn("Points already credited for transactionId={}", transactionId);
                return false;
            }

            BigDecimal currentBalance = getCurrentBalance(userId);
            BigDecimal newBalance = currentBalance.add(pointsAmount);

            PointsLedger ledgerEntry = PointsLedger.builder()
                .userId(userId)
                .transactionId(transactionId)
                .transactionType(PointsLedger.PointsTransactionType.DEPOSIT_CREDIT)
                .amount(pointsAmount)
                .balanceBefore(currentBalance)
                .balanceAfter(newBalance)
                .usdtAmount(usdtAmount)
                .exchangeRate(defaultExchangeRate)
                .description("USDT deposit credit")
                .status(PointsLedger.PointsTransactionStatus.COMPLETED)
                .build();

            pointsLedgerRepository.save(ledgerEntry);

            updateBalanceCache(userId, newBalance);

            log.info("Credited {} points to userId={} for USDT deposit", pointsAmount, userId);
            return true;

        } catch (Exception e) {
            log.error("Error crediting points for deposit: userId={}, amount={}", userId, pointsAmount, e);
            return false;
        }
    }


    
    public BigDecimal getCurrentBalance(UUID userId) {
        try {
            String cacheKey = BALANCE_CACHE_KEY + userId;
            Object cachedBalance = redisTemplate.opsForValue().get(cacheKey);

            if (cachedBalance instanceof Number) {
                return new BigDecimal(cachedBalance.toString());
            }

            BigDecimal balance = pointsLedgerRepository.getCurrentBalance(userId);
            if (balance == null) {
                balance = BigDecimal.ZERO;
            }

            redisTemplate.opsForValue().set(cacheKey, balance, 10, TimeUnit.MINUTES);

            return balance;

        } catch (Exception e) {
            log.error("Error getting balance for user: {}", userId, e);
            return BigDecimal.ZERO;
        }
    }

    
    @Transactional
    public boolean deductPoints(UUID userId, BigDecimal amount, String description) {
        try {
            log.info("Deducting {} points from user: {}", amount, userId);

            BigDecimal currentBalance = getCurrentBalance(userId);
            if (currentBalance.compareTo(amount) < 0) {
                throw new RuntimeException("Insufficient balance. Available: " + currentBalance + ", Required: " + amount);
            }

            BigDecimal newBalance = currentBalance.subtract(amount);

            PointsLedger debitEntry = PointsLedger.builder()
                .userId(userId)
                .transactionType(PointsLedger.PointsTransactionType.WITHDRAWAL_DEBIT)
                .amount(amount.negate()) 
                .balanceBefore(currentBalance)
                .balanceAfter(newBalance)
                .description(description)
                .transactionId("WITHDRAWAL_" + System.currentTimeMillis())
                .status(PointsLedger.PointsTransactionStatus.COMPLETED)
                .build();

            pointsLedgerRepository.save(debitEntry);

            updateBalanceCache(userId, newBalance);

            log.info("Successfully deducted {} points from user: {}, new balance: {}",
                amount, userId, newBalance);
            return true;

        } catch (Exception e) {
            log.error("Error deducting points for user: {}", userId, e);
            throw new RuntimeException("Failed to deduct points: " + e.getMessage());
        }
    }

    
    @Transactional
    public boolean addPoints(UUID userId, BigDecimal amount, String description) {
        try {
            log.info("Adding {} points to user: {}", amount, userId);

            BigDecimal currentBalance = getCurrentBalance(userId);
            BigDecimal newBalance = currentBalance.add(amount);

            PointsLedger creditEntry = PointsLedger.builder()
                .userId(userId)
                .transactionType(PointsLedger.PointsTransactionType.ADJUSTMENT)
                .amount(amount)
                .balanceBefore(currentBalance)
                .balanceAfter(newBalance)
                .description(description)
                .transactionId("CREDIT_" + System.currentTimeMillis())
                .status(PointsLedger.PointsTransactionStatus.COMPLETED)
                .build();

            pointsLedgerRepository.save(creditEntry);

            updateBalanceCache(userId, newBalance);

            log.info("Successfully added {} points to user: {}, new balance: {}",
                amount, userId, newBalance);
            return true;

        } catch (Exception e) {
            log.error("Error adding points for user: {}", userId, e);
            throw new RuntimeException("Failed to add points: " + e.getMessage());
        }
    }

    
    private void updateBalanceCache(UUID userId, BigDecimal newBalance) {
        try {
            redisTemplate.opsForValue().set(
                BALANCE_CACHE_KEY + userId,
                newBalance.toString(),
                30,
                TimeUnit.MINUTES
            );
        } catch (Exception e) {
            log.warn("Failed to update balance cache for user: {}", userId, e);
        }
    }

    
    @Transactional
    public boolean adjustBalance(UUID userId, BigDecimal amount, String reason,
                               PointsLedger.PointsTransactionType type) {
        try {
            BigDecimal currentBalance = getCurrentBalance(userId);
            BigDecimal newBalance = currentBalance.add(amount);

            if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
                log.warn("Adjustment would result in negative balance: user={}, current={}, adjustment={}",
                    userId, currentBalance, amount);
                return false;
            }

            PointsLedger adjustment = PointsLedger.builder()
                .userId(userId)
                .transactionType(type)
                .amount(amount)
                .balanceBefore(currentBalance)
                .balanceAfter(newBalance)
                .description(reason)
                .status(PointsLedger.PointsTransactionStatus.COMPLETED)
                .build();

            pointsLedgerRepository.save(adjustment);
            updateBalanceCache(userId, newBalance);

            log.info("✅ Balance adjusted: user={}, amount={}, reason={}", userId, amount, reason);
            return true;

        } catch (Exception e) {
            log.error("Error adjusting balance: userId={}, amount={}", userId, amount, e);
            return false;
        }
    }

    
    public List<PointsLedger> getTransactionHistory(UUID userId, int limit) {
        return pointsLedgerRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .stream()
            .limit(limit)
            .toList();
    }

    
    public Map<String, Object> getUserStats(UUID userId) {
        BigDecimal currentBalance = getCurrentBalance(userId);
        BigDecimal totalDeposits = pointsLedgerRepository.getTotalDepositCredits(userId);

        return Map.of(
            "currentBalance", currentBalance,
            "totalDeposits", totalDeposits
        );
    }

    
    public boolean hasSufficientBalance(UUID userId, BigDecimal amount) {
        BigDecimal currentBalance = getCurrentBalance(userId);
        return currentBalance.compareTo(amount) >= 0;
    }

    
    public BigDecimal getAvailableBalance(UUID userId) {
        BigDecimal current = getCurrentBalance(userId);
        BigDecimal pendingWithdrawals = pointsLedgerRepository.getTotalPendingWithdrawalLocks(userId);
        BigDecimal pendingEscrows = pointsLedgerRepository.getTotalPendingEscrowLocks(userId);

        return current.add(pendingWithdrawals).add(pendingEscrows);
    }

    
    @Transactional
    public boolean lockPointsForWithdrawal(UUID userId, BigDecimal amount, String withdrawalId) {
        String lockTxId = "WITHDRAWAL_LOCK_" + withdrawalId;
        if (pointsLedgerRepository.existsByTransactionId(lockTxId)) {
            log.info("Lock already exists: {}", lockTxId);
            return true;
        }
        BigDecimal available = getAvailableBalance(userId);
        if (available.compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient available balance");
        }

        PointsLedger lockEntry = PointsLedger.builder()
            .userId(userId)
            .transactionId(lockTxId)
            .transactionType(PointsLedger.PointsTransactionType.WITHDRAWAL_DEBIT)
            .amount(amount.negate())
            .balanceBefore(getCurrentBalance(userId))
            .balanceAfter(getCurrentBalance(userId)) 
            .description("Lock for withdrawal " + withdrawalId)
            .status(PointsLedger.PointsTransactionStatus.PENDING)
            .build();
        pointsLedgerRepository.save(lockEntry);
        log.info("Locked {} points for withdrawal {} (txId={})", amount, withdrawalId, lockTxId);
        return true;
    }

    
    @Transactional
    public void unlockPointsForWithdrawal(UUID userId, String withdrawalId) {
        String lockTxId = "WITHDRAWAL_LOCK_" + withdrawalId;
        Optional<PointsLedger> lockOpt = pointsLedgerRepository.findFirstByTransactionId(lockTxId);
        if (lockOpt.isEmpty()) return;
        PointsLedger lock = lockOpt.get();
        if (lock.getStatus() == PointsLedger.PointsTransactionStatus.PENDING) {
            lock.setStatus(PointsLedger.PointsTransactionStatus.CANCELLED);
            pointsLedgerRepository.save(lock);
            log.info("Unlocked points lock {} for user {}", lockTxId, userId);
        }
    }

    
    @Transactional
    public void finalizeWithdrawalDebit(UUID userId, BigDecimal amount, String withdrawalId) {
        String debitTxId = "WITHDRAWAL_DEBIT_" + withdrawalId;
        if (!pointsLedgerRepository.existsByTransactionId(debitTxId)) {
            BigDecimal currentBalance = getCurrentBalance(userId);
            BigDecimal newBalance = currentBalance.subtract(amount);
            if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
                throw new RuntimeException("Insufficient balance to finalize withdrawal");
            }
            PointsLedger debit = PointsLedger.builder()
                .userId(userId)
                .transactionId(debitTxId)
                .transactionType(PointsLedger.PointsTransactionType.WITHDRAWAL_DEBIT)
                .amount(amount.negate())
                .balanceBefore(currentBalance)
                .balanceAfter(newBalance)
                .description("Finalize withdrawal " + withdrawalId)
                .status(PointsLedger.PointsTransactionStatus.COMPLETED)
                .build();
            pointsLedgerRepository.save(debit);
            updateBalanceCache(userId, newBalance);
            log.info("Finalized withdrawal debit {} for user {} amount {}", withdrawalId, userId, amount);
        }

        unlockPointsForWithdrawal(userId, withdrawalId);
    }


    
    @Transactional
    public boolean lockProjectFunds(UUID employerId, BigDecimal amount, String projectId) {
        BigDecimal currentBalance = getCurrentBalance(employerId);
        if (currentBalance.compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance to fund project");
        }

        BigDecimal newBalance = currentBalance.subtract(amount);
        String transactionId = "PROJECT_FUND_" + projectId;

        if (pointsLedgerRepository.existsByTransactionId(transactionId)) {
            return true;
        }

        PointsLedger lock = PointsLedger.builder()
                .userId(employerId)
                .transactionId(transactionId)
                .transactionType(PointsLedger.PointsTransactionType.ESCROW_LOCK)
                .amount(amount.negate())
                .balanceBefore(currentBalance)
                .balanceAfter(newBalance)
                .description("Project funding lock for project " + projectId)
                .referenceId(projectId)
                .status(PointsLedger.PointsTransactionStatus.COMPLETED)
                .build();

        pointsLedgerRepository.save(lock);
        updateBalanceCache(employerId, newBalance);

        log.info("✅ Locked {} PTS from employer {} for project {}", amount, employerId, projectId);
        return true;
    }

    
    @Transactional
    public boolean releaseProjectFunds(UUID freelancerId, BigDecimal amount, String projectId, String milestoneId) {
        BigDecimal currentBalance = getCurrentBalance(freelancerId);
        BigDecimal newBalance = currentBalance.add(amount);
        String transactionId = "PROJECT_RELEASE_" + milestoneId;

        if (pointsLedgerRepository.existsByTransactionId(transactionId)) {
            return true;
        }

        PointsLedger release = PointsLedger.builder()
                .userId(freelancerId)
                .transactionId(transactionId)
                .transactionType(PointsLedger.PointsTransactionType.ESCROW_RELEASE)
                .amount(amount)
                .balanceBefore(currentBalance)
                .balanceAfter(newBalance)
                .description("Payment from project " + projectId + " (Milestone: " + milestoneId + ")")
                .referenceId(projectId)
                .status(PointsLedger.PointsTransactionStatus.COMPLETED)
                .build();

        pointsLedgerRepository.save(release);
        updateBalanceCache(freelancerId, newBalance);

        log.info("✅ Released {} PTS to freelancer {} for milestone {}", amount, freelancerId, milestoneId);
        return true;
    }

    
    public BigDecimal getProjectFundedAmount(String projectId) {
        List<PointsLedger> ledgers = pointsLedgerRepository.findByReferenceId(projectId);
        
        return ledgers.stream()
                .filter(pl -> pl.getTransactionType() == PointsLedger.PointsTransactionType.ESCROW_LOCK)
                .filter(pl -> pl.getStatus() == PointsLedger.PointsTransactionStatus.COMPLETED)
                .map(PointsLedger::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .abs();
    }

    
    @Transactional
    public boolean refundProjectFunds(UUID employerId, BigDecimal amount, String projectId) {
        BigDecimal currentBalance = getCurrentBalance(employerId);
        BigDecimal newBalance = currentBalance.add(amount);
        String transactionId = "PROJECT_REFUND_" + projectId + "_" + System.currentTimeMillis();

        PointsLedger refund = PointsLedger.builder()
                .userId(employerId)
                .transactionId(transactionId)
                .transactionType(PointsLedger.PointsTransactionType.ESCROW_REFUND)
                .amount(amount)
                .balanceBefore(currentBalance)
                .balanceAfter(newBalance)
                .description("Refund remaining funds for project " + projectId)
                .referenceId(projectId)
                .status(PointsLedger.PointsTransactionStatus.COMPLETED)
                .build();

        pointsLedgerRepository.save(refund);
        updateBalanceCache(employerId, newBalance);

        log.info("✅ Refunded {} PTS to employer {} for project {}", amount, employerId, projectId);
        return true;
    }


    
    @Transactional
    public boolean collectPlatformFee(UUID adminId, BigDecimal amount, String milestoneId) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) return true;

        BigDecimal currentBalance = getCurrentBalance(adminId);
        BigDecimal newBalance = currentBalance.add(amount);
        String transactionId = "FEE_COLLECT_" + milestoneId;

        if (pointsLedgerRepository.existsByTransactionId(transactionId)) {
            return true;
        }

        PointsLedger feeEntry = PointsLedger.builder()
                .userId(adminId)
                .transactionId(transactionId)
                .transactionType(PointsLedger.PointsTransactionType.PLATFORM_FEE_COLLECTION)
                .amount(amount)
                .balanceBefore(currentBalance)
                .balanceAfter(newBalance)
                .description("Platform fee for milestone " + milestoneId)
                .referenceId(milestoneId)
                .status(PointsLedger.PointsTransactionStatus.COMPLETED)
                .build();

        pointsLedgerRepository.save(feeEntry);
        updateBalanceCache(adminId, newBalance);

        log.info("💰 Collected {} PTS platform fee to admin {} for milestone {}", amount, adminId, milestoneId);
        return true;
    }
}
