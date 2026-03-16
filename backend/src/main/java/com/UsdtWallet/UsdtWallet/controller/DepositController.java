package com.UsdtWallet.UsdtWallet.controller;

import com.UsdtWallet.UsdtWallet.model.dto.SweepResultDto;
import com.UsdtWallet.UsdtWallet.model.dto.response.ApiResponse;
import com.UsdtWallet.UsdtWallet.model.entity.WalletTransaction;
import com.UsdtWallet.UsdtWallet.model.entity.User;
import com.UsdtWallet.UsdtWallet.model.entity.GasTopup;
import com.UsdtWallet.UsdtWallet.model.entity.TokenSweep;
import com.UsdtWallet.UsdtWallet.repository.WalletTransactionRepository;
import com.UsdtWallet.UsdtWallet.repository.UserRepository;
import com.UsdtWallet.UsdtWallet.repository.GasTopupRepository;
import com.UsdtWallet.UsdtWallet.repository.TokenSweepRepository;
import com.UsdtWallet.UsdtWallet.service.UsdtSweepService;
import com.UsdtWallet.UsdtWallet.service.DepositScannerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/deposits")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class DepositController {

    private final WalletTransactionRepository walletTransactionRepository;
    private final UsdtSweepService usdtSweepService;
    private final DepositScannerService depositScannerService;
    private final UserRepository userRepository;
    private final GasTopupRepository gasTopupRepository;
    private final TokenSweepRepository tokenSweepRepository;

    /**
     * GET /api/admin/deposits/recent
     * Danh sách deposit mới detect (limit mặc định 50)
     */
    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRecentDeposits(
            @RequestParam(defaultValue = "50") int limit) {
        try {
            Pageable pageable = PageRequest.of(0, Math.max(1, Math.min(limit, 200)));
            var page = walletTransactionRepository.findByTransactionTypeOrderByCreatedAtDesc(
                WalletTransaction.TransactionType.DEPOSIT, pageable
            );

            var enriched = page.getContent().stream().map(d -> {
                var m = new java.util.HashMap<String, Object>();
                m.put("id", d.getId());
                m.put("userId", d.getUserId());
                try {
                    java.util.Optional<User> u = userRepository.findById(d.getUserId());
                    m.put("username", u.map(User::getUsername).orElse(null));
                } catch (Exception ex) {
                    m.put("username", null);
                }
                m.put("amount", d.getAmount());
                m.put("fromAddress", d.getFromAddress());
                m.put("toAddress", d.getToAddress());
                m.put("txHash", d.getTxHash());
                m.put("createdAt", d.getCreatedAt());
                m.put("status", d.getStatus());
                return m;
            }).toList();

            Map<String, Object> result = Map.of(
                "deposits", enriched,
                "count", enriched.size()
            );

            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("Error fetching recent deposits", e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.<Map<String, Object>>builder()
                    .success(false)
                    .message("Failed to fetch recent deposits: " + e.getMessage())
                    .build());
        }
    }

    /**
     * GET /api/admin/deposits/pending
     * Các deposit detect nhưng chưa sweep (isSwept=false)
     */
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPendingUnsweptDeposits(
            @RequestParam(defaultValue = "50") int limit) {
        try {
            Pageable pageable = PageRequest.of(0, Math.max(1, Math.min(limit, 200)));
            var page = walletTransactionRepository.findByTransactionTypeAndIsSweptFalseOrderByCreatedAtDesc(
                WalletTransaction.TransactionType.DEPOSIT, pageable
            );

            var enriched = page.getContent().stream().map(d -> {
                var m = new java.util.HashMap<String, Object>();
                m.put("id", d.getId());
                m.put("userId", d.getUserId());
                try {
                    java.util.Optional<User> u = userRepository.findById(d.getUserId());
                    m.put("username", u.map(User::getUsername).orElse(null));
                } catch (Exception ex) {
                    m.put("username", null);
                }
                m.put("amount", d.getAmount());
                m.put("fromAddress", d.getFromAddress());
                m.put("toAddress", d.getToAddress());
                m.put("txHash", d.getTxHash());
                m.put("createdAt", d.getCreatedAt());
                m.put("status", d.getStatus());
                return m;
            }).toList();

            Map<String, Object> result = Map.of(
                "deposits", enriched,
                "count", enriched.size()
            );

            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("Error fetching pending deposits", e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.<Map<String, Object>>builder()
                    .success(false)
                    .message("Failed to fetch pending deposits: " + e.getMessage())
                    .build());
        }
    }

    /**
     * GET /api/admin/deposits/history
     * Full paginated deposit history for admin UI (paginated)
     */
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDepositsHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, Math.min(size, 500)));
            var pageRes = walletTransactionRepository.findByTransactionTypeOrderByCreatedAtDesc(
                WalletTransaction.TransactionType.DEPOSIT, pageable
            );

            var enriched = pageRes.getContent().stream().map(d -> {
                var m = new java.util.HashMap<String, Object>();
                m.put("id", d.getId());
                m.put("userId", d.getUserId());
                try {
                    java.util.Optional<User> u = userRepository.findById(d.getUserId());
                    m.put("username", u.map(User::getUsername).orElse(null));
                } catch (Exception ex) {
                    m.put("username", null);
                }
                m.put("amount", d.getAmount());
                m.put("fromAddress", d.getFromAddress());
                m.put("toAddress", d.getToAddress());
                m.put("txHash", d.getTxHash());
                m.put("createdAt", d.getCreatedAt());
                m.put("status", d.getStatus());
                return m;
            }).toList();

            Map<String, Object> result = Map.of(
                "deposits", enriched,
                "page", pageRes.getNumber(),
                "size", pageRes.getSize(),
                "totalElements", pageRes.getTotalElements(),
                "totalPages", pageRes.getTotalPages()
            );

            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("Error fetching deposit history", e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.<Map<String, Object>>builder()
                    .success(false)
                    .message("Failed to fetch deposit history: " + e.getMessage())
                    .build());
        }
    }

    /**
     * (Optional) POST /api/admin/deposits/sweep/{address}
     * Admin sweep thủ công 1 địa chỉ khi auto bị kẹt
     */
    @PostMapping("/sweep/{address}")
    public ResponseEntity<ApiResponse<SweepResultDto>> manualSweepAddress(@PathVariable String address) {
        try {
            log.info("Manual sweep triggered for address: {}", address);
            SweepResultDto result = usdtSweepService.sweepAddress(address);
            return ResponseEntity.ok(ApiResponse.success("Sweep executed", result));
        } catch (Exception e) {
            log.error("Error sweeping address {}", address, e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.<SweepResultDto>builder()
                    .success(false)
                    .message("Sweep failed: " + e.getMessage())
                    .build());
        }
    }

    /**
     * GET /api/admin/deposits/sweep/stats
     * Lấy thống kê sweep: unswept deposits, amounts, status
     */
    @GetMapping("/sweep/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSweepStats() {
        try {
            Map<String, Object> stats = usdtSweepService.getSweepStats();
            return ResponseEntity.ok(ApiResponse.success(stats));
        } catch (Exception e) {
            log.error("Error getting sweep stats", e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.<Map<String, Object>>builder()
                    .success(false)
                    .message("Failed to get sweep stats: " + e.getMessage())
                    .build());
        }
    }

    /**
     * GET /api/admin/deposits/scan/status
     * Lấy trạng thái scanner: last scanned block, current block, blocks behind
     */
    @GetMapping("/scan/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getScannerStatus() {
        try {
            Map<String, Object> stats = depositScannerService.getScanningStats();
            return ResponseEntity.ok(ApiResponse.success(stats));
        } catch (Exception e) {
            log.error("Error getting scanner status", e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.<Map<String, Object>>builder()
                    .success(false)
                    .message("Failed to get scanner status: " + e.getMessage())
                    .build());
        }
    }

    /**
     * POST /api/admin/deposits/scan/address
     * Manual scan 1 địa chỉ cụ thể trong block range
     */
    @PostMapping("/scan/address")
    public ResponseEntity<ApiResponse<Map<String, Object>>> scanAddress(
            @RequestBody Map<String, Object> request) {
        try {
            String address = (String) request.get("address");
            Long fromBlock = request.containsKey("fromBlock") ? 
                ((Number) request.get("fromBlock")).longValue() : null;
            Long toBlock = request.containsKey("toBlock") ? 
                ((Number) request.get("toBlock")).longValue() : null;

            if (address == null || address.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.<Map<String, Object>>builder()
                        .success(false)
                        .message("Address is required")
                        .build());
            }

            int processed = depositScannerService.scanAddressManually(address, fromBlock, toBlock);
            
            Map<String, Object> result = Map.of(
                "address", address,
                "fromBlock", fromBlock != null ? fromBlock : "auto",
                "toBlock", toBlock != null ? toBlock : "auto",
                "depositsProcessed", processed
            );

            return ResponseEntity.ok(ApiResponse.success("Address scan completed", result));
        } catch (Exception e) {
            log.error("Error scanning address", e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.<Map<String, Object>>builder()
                    .success(false)
                    .message("Address scan failed: " + e.getMessage())
                    .build());
        }
    }

    /**
     * POST /api/admin/deposits/scan/range
     * Scan 1 block range cụ thể
     */
    @PostMapping("/scan/range")
    public ResponseEntity<ApiResponse<Map<String, Object>>> scanBlockRange(
            @RequestBody Map<String, Object> request) {
        try {
            Long fromBlock = ((Number) request.get("fromBlock")).longValue();
            Long toBlock = ((Number) request.get("toBlock")).longValue();

            if (fromBlock == null || toBlock == null || fromBlock >= toBlock) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.<Map<String, Object>>builder()
                        .success(false)
                        .message("Invalid block range")
                        .build());
            }

            int processed = depositScannerService.scanBlockRange(fromBlock, toBlock);
            
            Map<String, Object> result = Map.of(
                "fromBlock", fromBlock,
                "toBlock", toBlock,
                "depositsProcessed", processed
            );

            return ResponseEntity.ok(ApiResponse.success("Block range scan completed", result));
        } catch (Exception e) {
            log.error("Error scanning block range", e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.<Map<String, Object>>builder()
                    .success(false)
                    .message("Block range scan failed: " + e.getMessage())
                    .build());
        }
    }

    /**
     * POST /api/admin/deposits/scan/reset
     * Reset scanner position (default: current - 50 blocks)
     */
    @PostMapping("/scan/reset")
    public ResponseEntity<ApiResponse<Map<String, Object>>> resetScannerPosition(
            @RequestBody(required = false) Map<String, Object> request) {
        try {
            Integer offsetBlocks = 50; // Default
            
            if (request != null && request.containsKey("offsetBlocks")) {
                offsetBlocks = ((Number) request.get("offsetBlocks")).intValue();
            }

            depositScannerService.resetToRecentBlocks(offsetBlocks);
            
            Map<String, Object> result = Map.of(
                "message", "Scanner position reset",
                "offsetBlocks", offsetBlocks
            );

            return ResponseEntity.ok(ApiResponse.success("Scanner reset completed", result));
        } catch (Exception e) {
            log.error("Error resetting scanner", e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.<Map<String, Object>>builder()
                    .success(false)
                    .message("Scanner reset failed: " + e.getMessage())
                    .build());
        }
    }

    /**
     * GET /api/admin/deposits/gas/topups
     * Lấy danh sách gas topups (có filter theo status)
     */
    @GetMapping("/gas/topups")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getGasTopups(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "100") int limit) {
        try {
            Pageable pageable = PageRequest.of(0, Math.min(limit, 500));
            
            java.util.List<GasTopup> topups;
            if (status != null && !status.trim().isEmpty()) {
                GasTopup.TopupStatus topupStatus = GasTopup.TopupStatus.valueOf(status.toUpperCase());
                topups = gasTopupRepository.findByStatus(topupStatus);
            } else {
                topups = gasTopupRepository.findAll();
            }

            // Limit results
            if (topups.size() > limit) {
                topups = topups.subList(0, limit);
            }

            Map<String, Object> result = Map.of(
                "topups", topups,
                "count", topups.size()
            );

            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("Error fetching gas topups", e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.<Map<String, Object>>builder()
                    .success(false)
                    .message("Failed to fetch gas topups: " + e.getMessage())
                    .build());
        }
    }

    /**
     * GET /api/admin/deposits/token/sweeps
     * Lấy danh sách token sweeps (có filter theo status)
     */
    @GetMapping("/token/sweeps")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTokenSweeps(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "100") int limit) {
        try {
            java.util.List<TokenSweep> sweeps;
            if (status != null && !status.trim().isEmpty()) {
                TokenSweep.SweepStatus sweepStatus = TokenSweep.SweepStatus.valueOf(status.toUpperCase());
                sweeps = tokenSweepRepository.findByStatus(sweepStatus);
            } else {
                sweeps = tokenSweepRepository.findAll();
            }

            // Limit results
            if (sweeps.size() > limit) {
                sweeps = sweeps.subList(0, limit);
            }

            Map<String, Object> result = Map.of(
                "sweeps", sweeps,
                "count", sweeps.size()
            );

            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("Error fetching token sweeps", e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.<Map<String, Object>>builder()
                    .success(false)
                    .message("Failed to fetch token sweeps: " + e.getMessage())
                    .build());
        }
    }
}
