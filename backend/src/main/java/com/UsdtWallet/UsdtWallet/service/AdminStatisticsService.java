package com.UsdtWallet.UsdtWallet.service;

import com.UsdtWallet.UsdtWallet.model.entity.*;
import com.UsdtWallet.UsdtWallet.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminStatisticsService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ProjectRepository projectRepository;
    private final ProposalRepository proposalRepository;
    private final EscrowRepository escrowRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final WithdrawalTransactionRepository withdrawalTransactionRepository;

    public SystemOverview getSystemOverview() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByIsActiveTrue();
        long totalEmployers = userRepository.countByRole("EMPLOYER");
        long totalFreelancers = userRepository.countByRole("FREELANCER");

        long totalJobs = jobRepository.count();
        long openJobs = jobRepository.countByStatus(Job.JobStatus.OPEN);
        long closedJobs = jobRepository.countByStatus(Job.JobStatus.CLOSED);

        long totalProjects = projectRepository.count();
        long activeProjects = projectRepository.countByStatus(Project.ProjectStatus.IN_PROGRESS);
        long completedProjects = projectRepository.countByStatus(Project.ProjectStatus.COMPLETED);
        long disputedProjects = projectRepository.countByStatus(Project.ProjectStatus.DISPUTED);
        long totalProposals = proposalRepository.count();
        long pendingProposals = proposalRepository.countByStatus(Proposal.ProposalStatus.PENDING);
        long awardedProposals = proposalRepository.countByStatus(Proposal.ProposalStatus.AWARDED);

        return SystemOverview.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .totalEmployers(totalEmployers)
                .totalFreelancers(totalFreelancers)
                .totalJobs(totalJobs)
                .openJobs(openJobs)
                .closedJobs(closedJobs)
                .totalProjects(totalProjects)
                .activeProjects(activeProjects)
                .completedProjects(completedProjects)
                .disputedProjects(disputedProjects)
                .totalProposals(totalProposals)
                .pendingProposals(pendingProposals)
                .awardedProposals(awardedProposals)
                .build();
    }

    public FinancialStatistics getFinancialStatistics() {
        BigDecimal totalDeposits = walletTransactionRepository.sumAmountByTransactionType("DEPOSIT");
        long depositCount = walletTransactionRepository.countByTransactionType("DEPOSIT");

        BigDecimal totalWithdrawals = withdrawalTransactionRepository.sumAllWithdrawals();
        BigDecimal pendingWithdrawals = withdrawalTransactionRepository.sumByStatus("PENDING");
        long withdrawalCount = withdrawalTransactionRepository.count();
        BigDecimal totalEscrowLocked = escrowRepository.findAll().stream()
                .filter(e -> e.getStatus() == Escrow.EscrowStatus.LOCKED)
                .map(Escrow::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalEscrowReleased = escrowRepository.findAll().stream()
                .filter(e -> e.getStatus() == Escrow.EscrowStatus.RELEASED)
                .map(Escrow::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalWithdrawalFees = withdrawalTransactionRepository.findAll().stream()
                .filter(w -> w.getStatus() == com.UsdtWallet.UsdtWallet.model.entity.WithdrawalTransaction.WithdrawalStatus.CONFIRMED)
                .map(w -> w.getFee())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal systemBalance = totalDeposits.subtract(totalWithdrawals);

        return FinancialStatistics.builder()
                .totalDeposits(totalDeposits != null ? totalDeposits : BigDecimal.ZERO)
                .depositCount(depositCount)
                .totalWithdrawals(totalWithdrawals != null ? totalWithdrawals : BigDecimal.ZERO)
                .withdrawalCount(withdrawalCount)
                .pendingWithdrawals(pendingWithdrawals != null ? pendingWithdrawals : BigDecimal.ZERO)
                .totalEscrowLocked(totalEscrowLocked)
                .totalEscrowReleased(totalEscrowReleased)
                .totalWithdrawalFees(totalWithdrawalFees)
                .systemBalance(systemBalance)
                .build();
    }

    public ActivityStatistics getActivityStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        long newUsers = userRepository.countByCreatedAtBetween(startDate, endDate);

        long newJobs = jobRepository.countByCreatedAtBetween(startDate, endDate);

        long newProjects = projectRepository.countByCreatedAtBetween(startDate, endDate);

        long completedProjects = projectRepository.countByCompletedAtBetween(startDate, endDate);
        long depositTransactions = walletTransactionRepository.countByCreatedAtBetweenAndTransactionType(
                startDate, endDate, "DEPOSIT");
        long withdrawalTransactions = withdrawalTransactionRepository.countByCreatedAtBetween(startDate, endDate);

        return ActivityStatistics.builder()
                .startDate(startDate)
                .endDate(endDate)
                .newUsers(newUsers)
                .newJobs(newJobs)
                .newProjects(newProjects)
                .completedProjects(completedProjects)
                .depositTransactions(depositTransactions)
                .withdrawalTransactions(withdrawalTransactions)
                .build();
    }

    public Map<String, Object> getTopFreelancers(int limit) {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Top freelancers feature - to be implemented");
        return result;
    }

    public Map<String, Object> getTopEmployers(int limit) {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Top employers feature - to be implemented");
        return result;
    }

    public DashboardSummary getDashboardSummary() {
        SystemOverview overview = getSystemOverview();
        FinancialStatistics financial = getFinancialStatistics();
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime last30Days = now.minusDays(30);
        ActivityStatistics recentActivity = getActivityStatistics(last30Days, now);

        return DashboardSummary.builder()
                .overview(overview)
                .financial(financial)
                .recentActivity(recentActivity)
                .lastUpdated(now)
                .build();
    }

    @lombok.Data
    @lombok.Builder
    public static class SystemOverview {
        private long totalUsers;
        private long activeUsers;
        private long totalEmployers;
        private long totalFreelancers;
        private long totalJobs;
        private long openJobs;
        private long closedJobs;
        private long totalProjects;
        private long activeProjects;
        private long completedProjects;
        private long disputedProjects;
        private long totalProposals;
        private long pendingProposals;
        private long awardedProposals;
    }

    @lombok.Data
    @lombok.Builder
    public static class FinancialStatistics {
        private BigDecimal totalDeposits;
        private long depositCount;
        private BigDecimal totalWithdrawals;
        private long withdrawalCount;
        private BigDecimal pendingWithdrawals;
        private BigDecimal totalEscrowLocked;
        private BigDecimal totalEscrowReleased;
        private BigDecimal totalWithdrawalFees;
        private BigDecimal systemBalance;
    }

    @lombok.Data
    @lombok.Builder
    public static class ActivityStatistics {
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private long newUsers;
        private long newJobs;
        private long newProjects;
        private long completedProjects;
        private long newDisputes;
        private long depositTransactions;
        private long withdrawalTransactions;
    }

    @lombok.Data
    @lombok.Builder
    public static class DashboardSummary {
        private SystemOverview overview;
        private FinancialStatistics financial;
        private ActivityStatistics recentActivity;
        private LocalDateTime lastUpdated;
    }
}
