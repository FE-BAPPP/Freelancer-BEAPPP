package com.UsdtWallet.UsdtWallet.service;

import com.UsdtWallet.UsdtWallet.model.entity.ChildWalletPool;
import com.UsdtWallet.UsdtWallet.model.entity.HdMasterWallet;
import com.UsdtWallet.UsdtWallet.repository.ChildWalletPoolRepository;
import com.UsdtWallet.UsdtWallet.repository.HdMasterWalletRepository;
import com.UsdtWallet.UsdtWallet.util.TronAddressUtil;
import com.UsdtWallet.UsdtWallet.util.EncryptionUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class HdWalletService {

    private final TronAddressUtil tronAddressUtil;
    private final HdMasterWalletRepository masterWalletRepository;
    private final ChildWalletPoolRepository childWalletPoolRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final RestTemplate restTemplate = new RestTemplate();
    private final EncryptionUtil encryptionUtil;

    @Value("${wallet.mnemonic.seed:}")
    private String mnemonicSeed;

    @Value("${wallet.pool.initialSize:1000}")
    private int initialPoolSize;

    @Value("${wallet.pool.minThreshold:200}")
    private int minThreshold;

    @Value("${wallet.pool.batchSize:500}")
    private int batchSize;

    @Value("${tron.api.url:https://api.trongrid.io}")
    private String tronApiUrl;

    @Value("${wallet.master.minTrxBalance:100}")
    private BigDecimal minTrxBalance;

    private static final String REDIS_ADDRESS_SET_KEY = "child_wallet_addresses";

    public HdWalletService(
            TronAddressUtil tronAddressUtil,
            HdMasterWalletRepository masterWalletRepository,
            ChildWalletPoolRepository childWalletPoolRepository,
            @Qualifier("customStringRedisTemplate") RedisTemplate<String, String> redisTemplate,
            EncryptionUtil encryptionUtil) {
        this.tronAddressUtil = tronAddressUtil;
        this.masterWalletRepository = masterWalletRepository;
        this.childWalletPoolRepository = childWalletPoolRepository;
        this.redisTemplate = redisTemplate;
        this.encryptionUtil = encryptionUtil;
    }

    @PostConstruct
    public void initialize() {
        log.info("Initializing HD Wallet Service...");

        initializeMasterWallet();

        checkAndLogMasterWalletBalance();

        initializeChildWalletPool();

        cacheAddressesToRedis();

        log.info("HD Wallet Service initialized successfully");
    }

    
    private void initializeMasterWallet() {
        Optional<HdMasterWallet> existingMaster = masterWalletRepository.findTopByOrderByIdDesc();

        if (existingMaster.isEmpty()) {
            log.info("Creating new master wallet...");

            String finalMnemonic = (mnemonicSeed == null || mnemonicSeed.isEmpty())
                ? tronAddressUtil.generateMnemonic()
                : mnemonicSeed;

            this.mnemonicSeed = finalMnemonic;

            TronAddressUtil.WalletInfo masterWallet = tronAddressUtil.deriveWallet(finalMnemonic, 0);

            HdMasterWallet master = new HdMasterWallet();
            master.setEncryptedMnemonic(encryptMnemonic(finalMnemonic));
            master.setMasterAddress(masterWallet.address());

            masterWalletRepository.save(master);
            log.info("Master wallet created: {}", masterWallet.address());
        } else {
            log.info("Master wallet already exists: {}", existingMaster.get().getMasterAddress());

            if (mnemonicSeed == null || mnemonicSeed.isEmpty()) {
                String encryptedMnemonic = existingMaster.get().getEncryptedMnemonic();
                this.mnemonicSeed = decryptMnemonic(encryptedMnemonic);
                log.info("Recovered mnemonic from existing master wallet");
            }
        }
    }

    
    public void checkAndLogMasterWalletBalance() {
        Optional<HdMasterWallet> masterWallet = masterWalletRepository.findTopByOrderByIdDesc();
        if (masterWallet.isPresent()) {
            String masterAddress = masterWallet.get().getMasterAddress();
            BigDecimal trxBalance = getTrxBalance(masterAddress);

            log.info("Master wallet {} TRX balance: {} TRX", masterAddress, trxBalance);

            if (trxBalance.compareTo(minTrxBalance) < 0) {
                log.warn("Master wallet low TRX balance. Current: {} TRX, Required: {} TRX",
                    trxBalance, minTrxBalance);
                log.warn("Please fund master wallet {} with at least {} TRX",
                    masterAddress, minTrxBalance);
            } else {
                log.info("Master wallet has sufficient TRX balance");
            }
        }
    }

    
    public BigDecimal getTrxBalance(String address) {
        try {
            String url = tronApiUrl + "/v1/accounts/" + address;
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response != null && response.containsKey("data")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> data = (List<Map<String, Object>>) response.get("data");
                if (!data.isEmpty()) {
                    Object balanceObj = data.get(0).get("balance");
                    if (balanceObj != null) {

                        BigDecimal sunBalance = new BigDecimal(balanceObj.toString());
                        return sunBalance.divide(new BigDecimal("1000000"));
                    }
                }
            }
            return BigDecimal.ZERO;
        } catch (Exception e) {
            log.warn("Failed to get TRX balance for address {}: {}", address, e.getMessage());
            return BigDecimal.ZERO;
        }
    }

    
    private void initializeChildWalletPool() {
        long currentPoolSize = childWalletPoolRepository.count();
        log.info("Current child wallet pool size: {}", currentPoolSize);

        if (currentPoolSize < initialPoolSize) {
            int walletsToGenerate = initialPoolSize - (int) currentPoolSize;
            log.info("Generating {} child wallets to reach target of {}", walletsToGenerate, initialPoolSize);
            generateChildWallets(walletsToGenerate);
        } else {
            log.info("✅ Child wallet pool already has {} wallets (target: {})", currentPoolSize, initialPoolSize);
        }
    }

    
    @Transactional
    public void generateChildWallets(int count) {
        int lastIndex = childWalletPoolRepository.findMaxDerivationIndex().orElse(0);
        List<ChildWalletPool> wallets = new ArrayList<>();

        log.info("Starting generation of {} child wallets from index {}", count, lastIndex + 1);

        for (int i = 1; i <= count; i++) {
            int currentIndex = lastIndex + i;
            TronAddressUtil.WalletInfo walletInfo = tronAddressUtil.deriveWallet(mnemonicSeed, currentIndex);

            ChildWalletPool wallet = new ChildWalletPool();
            wallet.setDerivationIndex(currentIndex);
            wallet.setAddress(walletInfo.address());
            wallet.setStatus(ChildWalletPool.WalletStatus.FREE);

            wallets.add(wallet);

            if (i % 100 == 0) {
                log.info("Generated {}/{} wallets", i, count);
            }
        }

        childWalletPoolRepository.saveAll(wallets);
        log.info("✅ Successfully generated {} child wallets", count);

        cacheAddressesToRedis();
    }

    
    @Transactional
    public void forceRegenerateChildWallets() {
        log.info("Force regenerating {} child wallets...", initialPoolSize);

        childWalletPoolRepository.deleteAll();
        redisTemplate.delete(REDIS_ADDRESS_SET_KEY);

        generateChildWallets(initialPoolSize);

        log.info("✅ Force regeneration completed");
    }

    
    @Transactional
    public ChildWalletPool assignWalletToUser(UUID userId) {
        Optional<ChildWalletPool> freeWallet = childWalletPoolRepository.findFirstByStatusOrderByIdAsc(
                ChildWalletPool.WalletStatus.FREE
        );

        if (freeWallet.isEmpty()) {
            log.warn("No free wallets available, generating more...");
            generateChildWallets(batchSize);
            freeWallet = childWalletPoolRepository.findFirstByStatusOrderByIdAsc(
                    ChildWalletPool.WalletStatus.FREE
            );
        }

        if (freeWallet.isPresent()) {
            ChildWalletPool wallet = freeWallet.get();
            wallet.setUserId(userId); 
            wallet.setStatus(ChildWalletPool.WalletStatus.ASSIGNED);

            ChildWalletPool saved = childWalletPoolRepository.save(wallet);
            log.info("Assigned wallet {} to user {}", wallet.getAddress(), userId);
            return saved;
        }

        throw new RuntimeException("Unable to assign wallet to user " + userId);
    }

    
    public Optional<ChildWalletPool> getWalletByAddress(String address) {
        return childWalletPoolRepository.findByAddress(address);
    }

    
    public ChildWalletPool getWalletByUserId(UUID userId) {
        return childWalletPoolRepository.findByUserId(userId).orElse(null);
    }

    
    public String getPrivateKeyForIndex(int index) {
        TronAddressUtil.WalletInfo walletInfo = tronAddressUtil.deriveWallet(mnemonicSeed, index);
        return walletInfo.privateKey();
    }

    
    public String getMasterPrivateKey() {
        return getPrivateKeyForIndex(0); 
    }

    
    public boolean isChildWalletAddress(String address) {
        return redisTemplate.opsForSet().isMember(REDIS_ADDRESS_SET_KEY, address);
    }

    
    private void cacheAddressesToRedis() {
        log.info("Caching child wallet addresses to Redis...");

        List<String> addresses = childWalletPoolRepository.findAllAddresses();
        if (!addresses.isEmpty()) {
            redisTemplate.delete(REDIS_ADDRESS_SET_KEY);
            redisTemplate.opsForSet().add(REDIS_ADDRESS_SET_KEY, addresses.toArray(new String[0]));
            log.info("Cached {} addresses to Redis", addresses.size());
        }
    }

    
    public PoolStats getPoolStats() {
        long totalWallets = childWalletPoolRepository.count();
        long freeWallets = childWalletPoolRepository.countByStatus(ChildWalletPool.WalletStatus.FREE);
        long assignedWallets = childWalletPoolRepository.countByStatus(ChildWalletPool.WalletStatus.ASSIGNED);
        long activeWallets = childWalletPoolRepository.countByStatus(ChildWalletPool.WalletStatus.ACTIVE);

        return new PoolStats(totalWallets, freeWallets, assignedWallets, activeWallets);
    }

    
    public HdMasterWallet getMasterWallet() {
        return masterWalletRepository.findTopByOrderByIdDesc()
            .orElseThrow(() -> new RuntimeException("Master wallet not found"));
    }

    
    public Map<String, Object> getWalletPoolStats() {
        long totalWallets = childWalletPoolRepository.count();
        long freeWallets = childWalletPoolRepository.countByStatus(ChildWalletPool.WalletStatus.FREE);
        long assignedWallets = childWalletPoolRepository.countByStatus(ChildWalletPool.WalletStatus.ASSIGNED);
        long activeWallets = childWalletPoolRepository.countByStatus(ChildWalletPool.WalletStatus.ACTIVE);

        HdMasterWallet masterWallet = getMasterWallet();
        BigDecimal masterTrxBalance = getTrxBalance(masterWallet.getMasterAddress());

        return Map.of(
            "totalWallets", totalWallets,
            "freeWallets", freeWallets,
            "assignedWallets", assignedWallets,
            "activeWallets", activeWallets,
            "masterAddress", masterWallet.getMasterAddress(),
            "masterTrxBalance", masterTrxBalance,
            "isLowBalance", masterTrxBalance.compareTo(minTrxBalance) < 0
        );
    }

    public record PoolStats(long total, long free, long assigned, long active) {}

    
    private String encryptMnemonic(String mnemonic) {
        try {
            return encryptionUtil.encrypt(mnemonic);
        } catch (Exception e) {
            log.error("Failed to encrypt mnemonic", e);
            throw new RuntimeException("Mnemonic encryption failed", e);
        }
    }

    
    private String decryptMnemonic(String encryptedMnemonic) {
        try {

            if (isValidEncryptedData(encryptedMnemonic)) {

                return encryptionUtil.decrypt(encryptedMnemonic);
            } else {

                log.warn("Found legacy unencrypted mnemonic in database. Will re-encrypt on next update.");

                if (isValidMnemonic(encryptedMnemonic)) {
                    return encryptedMnemonic;
                } else {
                    throw new RuntimeException("Invalid mnemonic format in database");
                }
            }
        } catch (Exception e) {
            log.error("Failed to decrypt mnemonic", e);
            throw new RuntimeException("Mnemonic decryption failed", e);
        }
    }

    
    private boolean isValidEncryptedData(String data) {
        try {

            Base64.getDecoder().decode(data);

            byte[] decoded = Base64.getDecoder().decode(data);
            return decoded.length >= (12 + 16 + 1);

        } catch (Exception e) {
            return false;
        }
    }

    
    private boolean isValidMnemonic(String mnemonic) {
        if (mnemonic == null || mnemonic.trim().isEmpty()) {
            return false;
        }

        String[] words = mnemonic.trim().split("\\s+");

        return words.length == 12 || words.length == 15 || words.length == 18 ||
               words.length == 21 || words.length == 24;
    }

    
    public Integer getChildIndexByAddress(String address) {
        try {
            Optional<ChildWalletPool> childWallet = childWalletPoolRepository.findByAddress(address);
            if (childWallet.isPresent()) {
                return childWallet.get().getDerivationIndex();
            }

            log.warn("Không tìm thấy child index cho address: {}", address);
            return null;

        } catch (Exception e) {
            log.error("Lỗi lấy child index cho address {}: {}", address, e.getMessage());
            return null;
        }
    }

    
    public String getPrivateKeyForAddress(String address) {
        try {
            Optional<ChildWalletPool> childWallet = childWalletPoolRepository.findByAddress(address);
            if (childWallet.isPresent()) {
                Integer derivationIndex = childWallet.get().getDerivationIndex();

                return getPrivateKeyForIndex(derivationIndex);
            }

            log.error("Không tìm thấy private key cho address: {}", address);
            return null;

        } catch (Exception e) {
            log.error("Lỗi lấy private key cho address {}: {}", address, e.getMessage());
            return null;
        }
    }
}
