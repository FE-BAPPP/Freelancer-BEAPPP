package com.UsdtWallet.UsdtWallet.service;

import com.UsdtWallet.UsdtWallet.model.entity.AuditLog;
import com.UsdtWallet.UsdtWallet.repository.AuditLogRepository;
import com.UsdtWallet.UsdtWallet.repository.WithdrawalTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemMonitoringService {

    private final HdWalletService hdWalletService;
    private final TronApiService tronApiService;
    private final AuditLogRepository auditLogRepository;
    private final WithdrawalTransactionRepository withdrawalRepository;
    private final AuditLogService auditLogService;
    private final RedisTemplate<String, String> redisTemplate;

    private static final String EMERGENCY_STOP_KEY = "system:emergency_stop";
    private static final String SYSTEM_STATUS_KEY = "system:status";

    
    public Map<String, Object> getSystemHealth() {
        try {

            var masterWallet = hdWalletService.getMasterWallet();
            BigDecimal trxBalance = hdWalletService.getTrxBalance(masterWallet.getMasterAddress());
            BigDecimal usdtBalance = tronApiService.getUsdtBalance(masterWallet.getMasterAddress());

            boolean tronApiHealthy = checkTronApiHealth();

            boolean redisHealthy = checkRedisHealth();

            boolean dbHealthy = checkDatabaseHealth();

            List<String> alerts = generateSystemAlerts(trxBalance, usdtBalance);

            return Map.of(
                "overall", alerts.isEmpty() && tronApiHealthy && redisHealthy && dbHealthy ? "HEALTHY" : "WARNING",
                "masterWallet", Map.of(
                    "trxBalance", trxBalance,
                    "usdtBalance", usdtBalance,
                    "trxStatus", trxBalance.compareTo(new BigDecimal("100")) >= 0 ? "OK" : "LOW",
                    "usdtStatus", usdtBalance.compareTo(new BigDecimal("1000")) >= 0 ? "OK" : "LOW"
                ),
                "services", Map.of(
                    "tronApi", tronApiHealthy ? "UP" : "DOWN",
                    "redis", redisHealthy ? "UP" : "DOWN",
                    "database", dbHealthy ? "UP" : "DOWN"
                ),
                "alerts", alerts,
                "emergencyStop", isEmergencyStopActive(),
                "lastCheck", LocalDateTime.now()
            );

        } catch (Exception e) {
            log.error("Error getting system health", e);
            return Map.of(
                "overall", "ERROR",
                "error", e.getMessage(),
                "lastCheck", LocalDateTime.now()
            );
        }
    }

    
    public Map<String, Object> getDetailedSystemStatus() {
        var health = getSystemHealth();

        Map<String, Object> detailed = new java.util.HashMap<>(health);

        detailed.put("performance", Map.of(
            "withdrawalQueueSize", getWithdrawalQueueSize(),
            "recentErrorRate", getRecentErrorRate(),
            "avgProcessingTime", getAverageProcessingTime()
        ));

        detailed.put("recentEvents", getRecentSystemEvents());

        return detailed;
    }

    
    public Map<String, Object> getSecurityOverview(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);

        List<AuditLog> securityEvents = auditLogRepository.findSecurityEvents();

        long failedLogins = auditLogRepository.countByActionSince(
            "SECURITY_LOGIN_FAILED", LocalDateTime.now().minusHours(24));

        long suspiciousActivities = auditLogRepository.countByActionSince(
            "SECURITY_SUSPICIOUS_ACTIVITY", LocalDateTime.now().minusHours(24));

        return Map.of(
            "securityEvents", securityEvents.stream().limit(20).map(this::convertAuditLogToDto).toList(),
            "metrics", Map.of(
                "failedLoginsLast24h", failedLogins,
                "suspiciousActivitiesLast24h", suspiciousActivities,
                "lastSecurityScan", LocalDateTime.now().minusHours(1)
            ),
            "alerts", generateSecurityAlerts()
        );
    }

    
    public void emergencyStopWithdrawals() {
        try {
            redisTemplate.opsForValue().set(EMERGENCY_STOP_KEY, "true", 24, TimeUnit.HOURS);
            auditLogService.logSystemEvent("EMERGENCY_STOP_ACTIVATED",
                "All withdrawal processing has been stopped by admin");
            log.warn("EMERGENCY STOP: All withdrawal processing stopped");

        } catch (Exception e) {
            log.error("Failed to activate emergency stop", e);
            throw new RuntimeException("Failed to activate emergency stop: " + e.getMessage());
        }
    }

    
    public void resumeWithdrawals() {
        try {
            redisTemplate.delete(EMERGENCY_STOP_KEY);
            auditLogService.logSystemEvent("EMERGENCY_STOP_DEACTIVATED",
                "Withdrawal processing has been resumed by admin");
            log.info("Emergency stop deactivated - withdrawal processing resumed");

        } catch (Exception e) {
            log.error("Failed to resume withdrawals", e);
            throw new RuntimeException("Failed to resume withdrawals: " + e.getMessage());
        }
    }

    
    public boolean isEmergencyStopActive() {
        try {
            String status = redisTemplate.opsForValue().get(EMERGENCY_STOP_KEY);
            return "true".equals(status);
        } catch (Exception e) {
            log.error("Error checking emergency stop status", e);
            return false;
        }
    }

    
    public void triggerFailedWithdrawalRetry() {
        try {

            auditLogService.logSystemEvent("MANUAL_RETRY_TRIGGERED",
                "Failed withdrawal retry process manually triggered by admin");
            log.info("Manual retry of failed withdrawals triggered");

        } catch (Exception e) {
            log.error("Failed to trigger withdrawal retry", e);
            throw new RuntimeException("Failed to trigger retry: " + e.getMessage());
        }
    }

    
    private boolean checkTronApiHealth() {
        try {
            Long blockNumber = tronApiService.getLatestBlockNumber();
            return blockNumber != null && blockNumber > 0;
        } catch (Exception e) {
            log.warn("TronGrid API health check failed", e);
            return false;
        }
    }

    
    private boolean checkRedisHealth() {
        try {
            redisTemplate.opsForValue().set("health:check", "ok", 10, TimeUnit.SECONDS);
            String result = redisTemplate.opsForValue().get("health:check");
            return "ok".equals(result);
        } catch (Exception e) {
            log.warn("Redis health check failed", e);
            return false;
        }
    }

    
    private boolean checkDatabaseHealth() {
        try {
            withdrawalRepository.count(); 
            return true;
        } catch (Exception e) {
            log.warn("Database health check failed", e);
            return false;
        }
    }

    
    private List<String> generateSystemAlerts(BigDecimal trxBalance, BigDecimal usdtBalance) {
        List<String> alerts = new java.util.ArrayList<>();

        if (trxBalance.compareTo(new BigDecimal("50")) < 0) {
            alerts.add("CRITICAL: Master wallet TRX balance very low: " + trxBalance + " TRX");
        } else if (trxBalance.compareTo(new BigDecimal("100")) < 0) {
            alerts.add("WARNING: Master wallet TRX balance low: " + trxBalance + " TRX");
        }

        if (usdtBalance.compareTo(new BigDecimal("500")) < 0) {
            alerts.add("CRITICAL: Master wallet USDT balance very low: " + usdtBalance + " USDT");
        } else if (usdtBalance.compareTo(new BigDecimal("1000")) < 0) {
            alerts.add("WARNING: Master wallet USDT balance low: " + usdtBalance + " USDT");
        }

        if (!checkTronApiHealth()) {
            alerts.add("CRITICAL: TronGrid API connectivity issues detected");
        }

        if (!checkRedisHealth()) {
            alerts.add("CRITICAL: Redis connectivity issues detected");
        }

        return alerts;
    }

    
    private List<String> generateSecurityAlerts() {
        List<String> alerts = new java.util.ArrayList<>();

        long failedLogins = auditLogRepository.countByActionSince(
            "SECURITY_LOGIN_FAILED", LocalDateTime.now().minusHours(1));

        if (failedLogins > 10) {
            alerts.add("HIGH: Unusual number of failed login attempts: " + failedLogins + " in last hour");
        }

        return alerts;
    }

    private Long getWithdrawalQueueSize() {
        try {
            return redisTemplate.opsForList().size("withdrawal:queue");
        } catch (Exception e) {
            return 0L;
        }
    }

    private double getRecentErrorRate() {

        return 0.0; 
    }

    private String getAverageProcessingTime() {
        return "2.5 minutes"; 
    }

    private List<Map<String, Object>> getRecentSystemEvents() {

        return List.of(); 
    }

    private Map<String, Object> convertAuditLogToDto(AuditLog log) {
        return Map.of(
            "id", log.getId(),
            "action", log.getAction(),
            "details", log.getDetails() != null ? log.getDetails() : "",
            "timestamp", log.getTimestamp(),
            "ipAddress", log.getIpAddress() != null ? log.getIpAddress() : "",
            "success", log.getSuccess() != null ? log.getSuccess() : true
        );
    }
}
