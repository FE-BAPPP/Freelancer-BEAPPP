package com.UsdtWallet.UsdtWallet.service;

import com.UsdtWallet.UsdtWallet.model.dto.request.UserRegistrationRequest;
import com.UsdtWallet.UsdtWallet.model.dto.request.UpdateProfileRequest;
import com.UsdtWallet.UsdtWallet.model.dto.response.UserRegistrationResponse;
import com.UsdtWallet.UsdtWallet.model.entity.ChildWalletPool;
import com.UsdtWallet.UsdtWallet.model.entity.EmployerProfile;
import com.UsdtWallet.UsdtWallet.model.entity.FreelancerProfile;
import com.UsdtWallet.UsdtWallet.model.entity.User;
import com.UsdtWallet.UsdtWallet.repository.UserRepository;
import com.UsdtWallet.UsdtWallet.repository.ChildWalletPoolRepository;
import com.UsdtWallet.UsdtWallet.repository.EmployerProfileRepository;
import com.UsdtWallet.UsdtWallet.repository.FreelancerProfileRepository;
import com.UsdtWallet.UsdtWallet.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final HdWalletService hdWalletService;
    private final PasswordEncoder passwordEncoder;
    private final ChildWalletPoolRepository childWalletPoolRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService; 
    private final FreelancerProfileRepository freelancerProfileRepository;
    private final EmployerProfileRepository employerProfileRepository;

    @Value("${security.passwordReset.withdrawalLockHours:24}")
    private long withdrawalLockHours;

    
    @Transactional
    public UserRegistrationResponse registerUser(UserRegistrationRequest request) {

        validateRegistrationRequest(request);

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User.Role userRole;
        try {
            userRole = User.Role.valueOf(request.getRole().toUpperCase());
            if (userRole != User.Role.FREELANCER && userRole != User.Role.EMPLOYER) {
                throw new RuntimeException("Invalid role. Must be FREELANCER or EMPLOYER");
            }
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role. Must be FREELANCER or EMPLOYER");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(userRole)
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);
        log.info("User created successfully: {} with role: {}", savedUser.getUsername(), userRole);

        ChildWalletPool assignedWallet = hdWalletService.assignWalletToUser(savedUser.getId());
        log.info("Wallet {} assigned to user {}", assignedWallet.getAddress(), savedUser.getUsername());

        if (userRole == User.Role.FREELANCER) {
            createFreelancerProfile(savedUser);
        } else if (userRole == User.Role.EMPLOYER) {
            createEmployerProfile(savedUser);
        }

        return UserRegistrationResponse.builder()
                .userId(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .role(savedUser.getRole().name())
                .walletAddress(assignedWallet.getAddress())
                .registeredAt(savedUser.getCreatedAt())
                .message("User registered successfully as " + userRole.name())
                .build();
    }

    
    private void createFreelancerProfile(User user) {
        FreelancerProfile profile = FreelancerProfile.builder()
                .user(user)
                .availability(FreelancerProfile.Availability.AVAILABLE)
                .build();
        freelancerProfileRepository.save(profile);
        log.info("Freelancer profile created for user: {}", user.getUsername());
    }

    
    private void createEmployerProfile(User user) {
        EmployerProfile profile = EmployerProfile.builder()
                .user(user)  
                .jobsPosted(0)
                .activeProjects(0)
                .totalSpent(BigDecimal.ZERO)
                .build();
        employerProfileRepository.save(profile);
        log.info("Employer profile created for user: {}", user.getUsername());
    }

    
    private void validateRegistrationRequest(UserRegistrationRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Password and confirm password do not match");
        }
    }

    
    public Map<String, Object> login(String username, String password) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }

        if (!user.isActive()) {
            throw new RuntimeException("Account is not active");
        }

        String token = jwtTokenProvider.createToken(user.getId(), user.getUsername(), user.getRole().name());

        String walletAddress = getUserWalletAddress(user.getId());

        return Map.of(
            "token", token,
            "user", Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "fullName", user.getFullName() != null ? user.getFullName() : "",
                "role", user.getRole(),
                "isAdmin", user.isAdmin(), 
                "walletAddress", walletAddress != null ? walletAddress : ""
            )
        );
    }

    
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }

    
    public String getUserWalletAddress(UUID userId) {

        ChildWalletPool wallet = childWalletPoolRepository.findByUserId(userId).orElse(null);
        return wallet != null ? wallet.getAddress() : null;
    }

    
    public Map<String, Object> getUserWalletInfo(UUID userId) {
        String walletAddress = getUserWalletAddress(userId);

        if (walletAddress == null || walletAddress.isEmpty()) {
            Map<String, Object> result = new java.util.HashMap<>();
            result.put("userId", userId.toString());
            result.put("walletAddress", "");
            result.put("address", "");
            result.put("depositAddress", "");
            result.put("network", "TRC20");
            result.put("status", "NOT_ASSIGNED");
            result.put("derivationIndex", -1);
            result.put("note", "Wallet not assigned. Please contact support.");
            return result;
        }

        ChildWalletPool wallet = childWalletPoolRepository.findByAddress(walletAddress).orElse(null);

        Map<String, Object> result = new java.util.HashMap<>();
        result.put("userId", userId.toString());
        result.put("walletAddress", walletAddress);
        result.put("address", walletAddress);
        result.put("depositAddress", walletAddress);
        result.put("network", "TRC20");
        result.put("status", wallet != null ? wallet.getStatus().toString() : "ACTIVE");
        result.put("derivationIndex", wallet != null ? wallet.getDerivationIndex() : -1);
        result.put("assignedAt", wallet != null && wallet.getCreatedAt() != null ? wallet.getCreatedAt() : LocalDateTime.now());
        result.put("note", "Only send USDT (TRC20) to this address");
        
        return result;
    }

    
    public Map<String, Object> getUserTransactions(UUID userId, int page, int size) {

        String walletAddress = getUserWalletAddress(userId);

        return Map.of(
            "transactions", java.util.List.of(), 
            "walletAddress", walletAddress,
            "totalElements", 0,
            "totalPages", 0,
            "currentPage", page,
            "pageSize", size
        );
    }

    
    public Map<String, Object> getUserInfo(String userId) {
        UUID userUuid = UUID.fromString(userId);
        User user = userRepository.findById(userUuid)
            .orElseThrow(() -> new RuntimeException("User not found"));

        String walletAddress = getUserWalletAddress(userUuid);

        Map<String, Object> userInfo = new java.util.HashMap<>();
        userInfo.put("id", user.getId().toString());
        userInfo.put("username", user.getUsername());
        userInfo.put("email", user.getEmail());
        userInfo.put("fullName", user.getFullName() != null ? user.getFullName() : "");
        userInfo.put("phone", user.getPhone() != null ? user.getPhone() : "");
        userInfo.put("role", user.getRole());
        userInfo.put("isActive", user.getIsActive());
        userInfo.put("isAdmin", user.isAdmin());
        userInfo.put("walletAddress", walletAddress != null ? walletAddress : "");
        userInfo.put("createdAt", user.getCreatedAt());
        userInfo.put("updatedAt", user.getUpdatedAt());

        userInfo.put("twoFactorEnabled", user.isTwoFactorEnabled());
        userInfo.put("twoFactorEnabledAt", user.getTwoFactorEnabledAt());
        userInfo.put("withdrawalsDisabledUntil", user.getWithdrawalsDisabledUntil());

        return userInfo;
    }

    
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    
    @Transactional
    public Map<String, Object> createAdminAccount(String username, String password, String email, String fullName) {
        try {
            log.info("=== CREATING ADMIN ACCOUNT ===");
            log.info("Username: {}, Email: {}, FullName: {}", username, email, fullName);

            log.info("Checking dependencies...");
            if (userRepository == null) {
                log.error("userRepository is null!");
                throw new RuntimeException("UserRepository is null");
            }
            if (passwordEncoder == null) {
                log.error("passwordEncoder is null!");
                throw new RuntimeException("PasswordEncoder is null");
            }
            if (hdWalletService == null) {
                log.error("hdWalletService is null!");
                throw new RuntimeException("HdWalletService is null");
            }
            log.info("All dependencies are OK");

            log.info("Checking if username exists...");
            boolean usernameExists = userRepository.existsByUsername(username);
            log.info("Username exists check result: {}", usernameExists);

            if (usernameExists) {
                log.error("Admin username already exists: {}", username);
                throw new RuntimeException("Admin username already exists: " + username);
            }

            log.info("Checking if email exists...");
            boolean emailExists = userRepository.existsByEmail(email);
            log.info("Email exists check result: {}", emailExists);

            if (emailExists) {
                log.error("Admin email already exists: {}", email);
                throw new RuntimeException("Admin email already exists: " + email);
            }

            String masterWalletAddress = null;
            try {
                log.info("Getting master wallet...");
                var masterWallet = hdWalletService.getMasterWallet();
                if (masterWallet != null) {
                    masterWalletAddress = masterWallet.getMasterAddress();
                    log.info("Master wallet address: {}", masterWalletAddress);
                } else {
                    log.warn("Master wallet is null");
                }
            } catch (Exception e) {
                log.warn("Could not get master wallet address: {}", e.getMessage());
                log.warn("Will create admin without master wallet address");
            }

            log.info("Creating admin user entity...");
            log.info("Encoding password...");
            String encodedPassword = passwordEncoder.encode(password);
            log.info("Password encoded successfully, length: {}", encodedPassword.length());

            User admin = User.builder()
                    .username(username)
                    .email(email)
                    .password(encodedPassword)
                    .fullName(fullName)
                    .role(User.Role.ADMIN)
                    .isActive(true)
                    .build();

            log.info("Admin user entity created successfully");
            log.info("Admin details - Username: {}, Email: {}, Role: {}",
                admin.getUsername(), admin.getEmail(), admin.getRole());

            log.info("Saving admin user to database...");
            User savedAdmin = userRepository.save(admin);
            log.info("Admin saved with ID: {}", savedAdmin.getId());

            log.info("Building result map...");
            Map<String, Object> adminData = Map.of(
                "id", savedAdmin.getId().toString(),
                "username", savedAdmin.getUsername(),
                "email", savedAdmin.getEmail(),
                "fullName", savedAdmin.getFullName() != null ? savedAdmin.getFullName() : "",
                "role", savedAdmin.getRole().toString(),
                "masterWalletAddress", masterWalletAddress != null ? masterWalletAddress : "",
                "createdAt", savedAdmin.getCreatedAt() != null ? savedAdmin.getCreatedAt().toString() : ""
            );

            Map<String, Object> result = Map.of(
                "success", true,
                "message", "Admin account created successfully",
                "admin", adminData
            );

            log.info("Admin account created successfully: {} with master wallet address: {}",
                    savedAdmin.getUsername(), masterWalletAddress);

            return result;

        } catch (Exception e) {
            log.error("Error in createAdminAccount - Exception type: {}", e.getClass().getSimpleName());
            log.error("Error in createAdminAccount - Message: {}", e.getMessage());
            log.error("Error in createAdminAccount - Stack trace: ", e);
            throw e; 
        }
    }

    
    @Transactional
    public boolean updatePassword(UUID userId, String encodedPassword) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return false;
        user.setPassword(encodedPassword);

        user.setPasswordChangedAt(java.time.LocalDateTime.now());
        user.setWithdrawalsDisabledUntil(java.time.LocalDateTime.now().plusHours(withdrawalLockHours));
        userRepository.save(user);
        log.info("Password updated for user {}. Withdrawals locked until {}", userId, user.getWithdrawalsDisabledUntil());
        try {
            if (user.getEmail() != null && !user.getEmail().isEmpty()) {
                emailService.sendPasswordChangedEmail(user.getEmail());
            }
        } catch (Exception e) {
            log.warn("Failed to send password-changed email for user {}: {}", userId, e.getMessage());
        }
        return true;
    }

    
    @Transactional
    public Map<String, Object> updateProfile(UUID userId, UpdateProfileRequest req) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (req.fullName != null) user.setFullName(req.fullName.trim());
        if (req.phone != null) user.setPhone(req.phone.trim());
        if (req.avatar != null) user.setAvatar(req.avatar.trim());
        if (req.email != null && !req.email.trim().isEmpty()) user.setEmail(req.email.trim());

        userRepository.save(user);

        String walletAddress = getUserWalletAddress(user.getId());

        return Map.of(
            "id", user.getId().toString(),
            "username", user.getUsername(),
            "email", user.getEmail(),
            "fullName", user.getFullName() != null ? user.getFullName() : "",
            "phone", user.getPhone() != null ? user.getPhone() : "",
            "avatar", user.getAvatar() != null ? user.getAvatar() : "",
            "walletAddress", walletAddress != null ? walletAddress : "",
            "updatedAt", user.getUpdatedAt()
        );
    }

    
    @Transactional
    public boolean verifyEmail(String token) {
        User user = userRepository.findByEmailVerificationToken(token)
            .orElse(null);
        
        if (user == null) {
            log.warn("Email verification failed: token not found");
            return false;
        }

        if (user.getEmailVerificationTokenExpiresAt() != null 
            && user.getEmailVerificationTokenExpiresAt().isBefore(LocalDateTime.now())) {
            log.warn("Email verification failed: token expired for user {}", user.getUsername());
            return false;
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationTokenExpiresAt(null);
        userRepository.save(user);
        
        log.info("Email verified successfully for user: {}", user.getUsername());
        return true;
    }

    
    @Transactional
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User with email " + email + " not found"));
        
        if (user.isEmailVerified()) {
            throw new RuntimeException("Email is already verified");
        }

        String token = UUID.randomUUID().toString();
        user.setEmailVerificationToken(token);
        user.setEmailVerificationTokenExpiresAt(LocalDateTime.now().plusHours(24));
        userRepository.save(user);

        emailService.sendEmailVerificationEmail(user.getEmail(), token);
        log.info("Verification email resent to: {}", email);
    }

    
    public void sendVerificationEmail(User user) {
        String token = UUID.randomUUID().toString();
        user.setEmailVerificationToken(token);
        user.setEmailVerificationTokenExpiresAt(LocalDateTime.now().plusHours(24));
        userRepository.save(user);
        
        emailService.sendEmailVerificationEmail(user.getEmail(), token);
        log.info("Verification email sent to new user: {}", user.getEmail());
    }

    
    @Transactional
    public String uploadAvatar(UUID userId, org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
            ? originalFilename.substring(originalFilename.lastIndexOf("."))
            : ".jpg";
        String filename = "avatar_" + userId.toString() + "_" + System.currentTimeMillis() + extension;

        java.nio.file.Path avatarDir = java.nio.file.Paths.get("uploads", "avatars");
        java.nio.file.Files.createDirectories(avatarDir);

        if (user.getAvatar() != null && !user.getAvatar().isEmpty()) {
            try {
                String oldFilename = user.getAvatar().substring(user.getAvatar().lastIndexOf("/") + 1);
                java.nio.file.Path oldPath = avatarDir.resolve(oldFilename);
                java.nio.file.Files.deleteIfExists(oldPath);
            } catch (Exception e) {
                log.warn("Failed to delete old avatar: {}", e.getMessage());
            }
        }

        java.nio.file.Path filePath = avatarDir.resolve(filename);
        java.nio.file.Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

        String avatarUrl = "/files/avatars/" + filename;
        user.setAvatar(avatarUrl);
        userRepository.save(user);

        log.info("Avatar uploaded for user {}: {}", userId, avatarUrl);
        return avatarUrl;
    }

    
    @Transactional
    public void deleteAvatar(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getAvatar() != null && !user.getAvatar().isEmpty()) {
            try {
                String filename = user.getAvatar().substring(user.getAvatar().lastIndexOf("/") + 1);
                java.nio.file.Path avatarPath = java.nio.file.Paths.get("uploads", "avatars", filename);
                java.nio.file.Files.deleteIfExists(avatarPath);
            } catch (Exception e) {
                log.warn("Failed to delete avatar file: {}", e.getMessage());
            }
        }

        user.setAvatar(null);
        userRepository.save(user);
        log.info("Avatar deleted for user {}", userId);
    }
}
