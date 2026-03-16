package com.UsdtWallet.UsdtWallet.service;

import com.UsdtWallet.UsdtWallet.util.TronAddressUtil;
import com.UsdtWallet.UsdtWallet.util.TronKeys;
import com.UsdtWallet.UsdtWallet.util.TronTransactionSigner;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class TronApiService {

    private final RestTemplate restTemplate;

    @Value("${tron.api.url:https://nile.trongrid.io}")
    private String tronApiUrl;

    @Value("${tron.api.key:}")
    private String tronApiKey;

    @Value("${tron.usdt.contract:TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf}")
    private String usdtContractAddress;

    private final Map<Long, Long> blockTimestampCache = new ConcurrentHashMap<>();

    private final Map<String, BroadcastRetryInfo> retryQueue = new ConcurrentHashMap<>();

    private static class BroadcastRetryInfo {
        public final String signedTx;
        public final long firstAttempt;
        public int retryCount;

        public BroadcastRetryInfo(String signedTx) {
            this.signedTx = signedTx;
            this.firstAttempt = System.currentTimeMillis();
            this.retryCount = 0;
        }
    }

    
    public Long getLatestBlockNumber() {
        try {
            String url = tronApiUrl + "/wallet/getnowblock";

            HttpHeaders headers = createHeaders();
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> blockHeader = (Map<String, Object>) response.getBody().get("block_header");
                if (blockHeader != null) {
                    Map<String, Object> rawData = (Map<String, Object>) blockHeader.get("raw_data");
                    if (rawData != null) {
                        Object numberObj = rawData.get("number");
                        if (numberObj instanceof Number) {
                            Long blockNumber = ((Number) numberObj).longValue();
                            log.debug("Latest Nile testnet block: {}", blockNumber);
                            return blockNumber;
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error getting latest block number from Nile testnet", e);
        }
        return null;
    }

    
    public BigDecimal getUsdtBalance(String address) {
        try {
            log.debug("Getting USDT balance for address: {}", address);

            BigDecimal constantContractBalance = getUsdtBalanceFromConstantContract(address);
            if (constantContractBalance.compareTo(BigDecimal.ZERO) > 0) {
                log.debug("USDT balance from triggerConstantContract: {} USDT", constantContractBalance);
                return constantContractBalance;
            }

            log.debug("Falling back to getAccount for USDT balance (may be delayed)");
            BigDecimal accountBalance = getAccountTrc20Balance(address, usdtContractAddress);
            log.debug("USDT balance from getAccount (cached): {} USDT", accountBalance);

            return accountBalance;

        } catch (Exception e) {
            log.error("Error getting USDT balance for address: {} on Nile testnet", address, e);
            return BigDecimal.ZERO;
        }
    }

    
    private BigDecimal getUsdtBalanceFromConstantContract(String address) {
        try {
            Map<String, Object> request = new HashMap<>();
            request.put("owner_address", "TLsV52sRDL79HXGGm9yzwKibb6BeruhUzy");
            request.put("contract_address", usdtContractAddress);
            request.put("function_selector", "balanceOf(address)");

            String hexAddress = TronAddressUtil.base58ToHex(address);
            if (hexAddress.startsWith("0x")) hexAddress = hexAddress.substring(2);
            if (hexAddress.startsWith("41")) hexAddress = hexAddress.substring(2);
            String paddedAddress = String.format("%64s", hexAddress).replace(' ', '0');
            request.put("parameter", paddedAddress);
            request.put("visible", true);

            String url = tronApiUrl + "/wallet/triggerconstantcontract";

            HttpHeaders headers = createHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Object resultObj = response.getBody().get("constant_result");
                if (resultObj instanceof List && !((List<?>) resultObj).isEmpty()) {
                    List<String> constantResult = (List<String>) resultObj;
                    String balanceHex = constantResult.get(0);

                    if (balanceHex != null && !balanceHex.isEmpty()) {
                        BigInteger balanceWei = new BigInteger(balanceHex, 16);
                        BigDecimal usdtBalance = new BigDecimal(balanceWei).divide(new BigDecimal("1000000"));
                        return usdtBalance;
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error calling triggerConstantContract for USDT balance: {}", e.getMessage());
        }
        return BigDecimal.ZERO;
    }

    
    private BigDecimal getAccountTrc20Balance(String address, String contractAddress) {
        try {
            Map<String, Object> request = new HashMap<>();
            request.put("address", address);
            request.put("visible", true);

            String url = tronApiUrl + "/wallet/getaccount";

            HttpHeaders headers = createHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {

                Object trc20Obj = response.getBody().get("trc20");
                if (trc20Obj instanceof List) {
                    List<Map<String, Object>> trc20List = (List<Map<String, Object>>) trc20Obj;
                    for (Map<String, Object> token : trc20List) {
                        String tokenAddress = (String) token.get("contract_address");
                        if (contractAddress.equalsIgnoreCase(tokenAddress)) {
                            Object balanceObj = token.get("balance");
                            if (balanceObj instanceof String) {
                                BigInteger balanceWei = new BigInteger((String) balanceObj);
                                return new BigDecimal(balanceWei).divide(new BigDecimal("1000000"));
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error getting TRC20 balance for {}", address, e);
        }
        return BigDecimal.ZERO;
    }

    
    public BigDecimal getTrxBalance(String address) {
        try {
            Map<String, Object> request = new HashMap<>();
            request.put("address", address);
            request.put("visible", true);

            String url = tronApiUrl + "/wallet/getaccount";

            HttpHeaders headers = createHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Object balanceObj = response.getBody().get("balance");
                if (balanceObj instanceof Number) {
                    BigInteger balanceInSun = BigInteger.valueOf(((Number) balanceObj).longValue());
                    BigDecimal trxBalance = new BigDecimal(balanceInSun).divide(new BigDecimal("1000000"));
                    log.debug("TRX balance for {}: {} TRX", address, trxBalance);
                    return trxBalance;
                }
            }
        } catch (Exception e) {
            log.error("Error getting TRX balance for address: {} on Nile testnet", address, e);
        }
        return BigDecimal.ZERO;
    }

    
    public List<Map<String, Object>> getTransactionsInRange(String address, Long fromBlock, Long toBlock) {
        try {

            long fromTimestamp = getBlockTimestampAccurate(fromBlock);
            long toTimestamp = getBlockTimestampAccurate(toBlock);

            String url = String.format(
                "%s/v1/accounts/%s/transactions/trc20?limit=200&min_timestamp=%d&max_timestamp=%d&contract_address=%s",
                tronApiUrl, address, fromTimestamp, toTimestamp, usdtContractAddress);

            log.debug("Scanning Nile testnet transactions: {} (blocks {}-{}, timestamps {}-{})",
                address, fromBlock, toBlock, fromTimestamp, toTimestamp);

            HttpHeaders headers = createHeaders();
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Object dataObj = response.getBody().get("data");
                if (dataObj instanceof List) {
                    List<Map<String, Object>> transactions = (List<Map<String, Object>>) dataObj;

                    List<Map<String, Object>> validTransactions = new ArrayList<>();
                    for (Map<String, Object> tx : transactions) {
                        String txId = (String) tx.get("transaction_id");
                        if (isTransactionSuccessful(txId)) {
                            validTransactions.add(tx);
                        } else {
                            log.debug("Filtered out failed transaction: {}", txId);
                        }
                    }

                    log.debug("Found {} valid TRC20 transactions for address {} (filtered {} failed)",
                        validTransactions.size(), address, transactions.size() - validTransactions.size());
                    return validTransactions;
                }
            }
        } catch (Exception e) {
            log.error("Error getting transactions for address: {} on Nile testnet", address, e);
        }
        return List.of();
    }

    
    private long getBlockTimestampAccurate(Long blockNumber) {

        if (blockTimestampCache.containsKey(blockNumber)) {
            return blockTimestampCache.get(blockNumber);
        }

        try {
            Map<String, Object> request = new HashMap<>();
            request.put("num", blockNumber);

            String url = tronApiUrl + "/wallet/getblockbynum";

            HttpHeaders headers = createHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> blockHeader = (Map<String, Object>) response.getBody().get("block_header");
                if (blockHeader != null) {
                    Map<String, Object> rawData = (Map<String, Object>) blockHeader.get("raw_data");
                    if (rawData != null) {
                        Object timestampObj = rawData.get("timestamp");
                        if (timestampObj instanceof Number) {
                            long timestamp = ((Number) timestampObj).longValue();
                            blockTimestampCache.put(blockNumber, timestamp);
                            log.debug("Block {} accurate timestamp: {}", blockNumber, timestamp);
                            return timestamp;
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to get accurate timestamp for block {}, falling back to approximation: {}",
                blockNumber, e.getMessage());
        }

        long approximateTimestamp = blockNumber * 3000;
        blockTimestampCache.put(blockNumber, approximateTimestamp);
        return approximateTimestamp;
    }

    
    private boolean isTransactionSuccessful(String txId) {
        try {
            Map<String, Object> txInfo = getTransactionInfo(txId);
            if (txInfo != null) {
                Object resultObj = txInfo.get("result");
                if (resultObj instanceof String) {
                    return "SUCCESS".equals(resultObj);
                }
                return !txInfo.containsKey("result") || txInfo.get("result") == null;
            }
        } catch (Exception e) {
            log.debug("Could not verify transaction status for {}: {}", txId, e.getMessage());
        }
        return true;
    }

    
    public String broadcastTransaction(String signedTransactionJson) {
        String txHash = broadcastTransactionInternal(signedTransactionJson);

        if (txHash == null) {
            String retryId = "retry_" + System.currentTimeMillis();
            retryQueue.put(retryId, new BroadcastRetryInfo(signedTransactionJson));
            log.warn("Transaction broadcast failed, added to retry queue: {}", retryId);

            log.info("Attempting immediate retry for failed broadcast...");
            txHash = broadcastTransactionInternal(signedTransactionJson);
            if (txHash != null) {
                retryQueue.remove(retryId);
                log.info("Immediate retry successful: {}", txHash);
            }
        }

        return txHash;
    }

    
    private String broadcastTransactionInternal(String signedTransactionJson) {
        try {
            log.debug("Broadcasting signed transaction: {}", signedTransactionJson.substring(0, Math.min(200, signedTransactionJson.length())) + "...");

            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> transactionMap = mapper.readValue(signedTransactionJson, new TypeReference<Map<String, Object>>() {});

            String url = tronApiUrl + "/wallet/broadcasttransaction";

            HttpHeaders headers = createHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(transactionMap, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Boolean result = (Boolean) response.getBody().get("result");
                if (Boolean.TRUE.equals(result)) {
                    String txHash = (String) response.getBody().get("txid");
                    log.info("Transaction broadcasted to Nile testnet: {}", txHash);
                    return txHash;
                } else {
                    log.error("Failed to broadcast transaction to Nile testnet: {}", response.getBody());
                }
            }
        } catch (Exception e) {
            log.error("Error broadcasting transaction to Nile testnet: {}", e.getMessage(), e);
        }
        return null;
    }

    
    public void processRetryQueue() {
        if (retryQueue.isEmpty()) {
            return;
        }

        log.info("Processing {} items in broadcast retry queue", retryQueue.size());

        retryQueue.entrySet().removeIf(entry -> {
            String retryId = entry.getKey();
            BroadcastRetryInfo retryInfo = entry.getValue();

            if (System.currentTimeMillis() - retryInfo.firstAttempt > 24 * 60 * 60 * 1000) {
                log.warn("Removing expired retry item: {}", retryId);
                return true;
            }

            if (retryInfo.retryCount >= 5) {
                log.warn("Removing retry item after {} attempts: {}", retryInfo.retryCount, retryId);
                return true;
            }

            retryInfo.retryCount++;
            String txHash = broadcastTransactionInternal(retryInfo.signedTx);
            if (txHash != null) {
                log.info("Retry broadcast successful after {} attempts: {}", retryInfo.retryCount, txHash);
                return true;
            }

            log.warn("Retry broadcast failed (attempt {}): {}", retryInfo.retryCount, retryId);
            return false;
        });
    }

    
    public Map<String, Object> getTransactionInfo(String txid) {
        String url = tronApiUrl + "/wallet/gettransactioninfobyid";
        HttpHeaders headers = createHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        Map<String, Object> req = Map.of("value", txid);
        ResponseEntity<Map> res = restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(req, headers), Map.class);
        return res.getBody();
    }


    
    public Map<String, Object> getTransactionByHash(String txHash) {
        try {
            Map<String, Object> request = new HashMap<>();
            request.put("value", txHash);

            String url = tronApiUrl + "/wallet/gettransactionbyid";

            HttpHeaders headers = createHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                log.debug("Retrieved transaction {} from Nile testnet", txHash);
                return response.getBody();
            }
        } catch (Exception e) {
            log.error("Error getting transaction by hash: {} from Nile testnet", txHash, e);
        }
        return null;
    }

    
    public Map<String, Object> getNetworkInfo() {
        try {
            String url = tronApiUrl + "/wallet/getnodeinfo";

            HttpHeaders headers = createHeaders();
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.error("Error getting Nile testnet info", e);
        }
        return Map.of("network", "nile", "status", "unknown");
    }

    
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        if (tronApiKey != null && !tronApiKey.isEmpty()) {
            headers.set("TRON-PRO-API-KEY", tronApiKey);
            log.trace("Using TronGrid API key for enhanced rate limits");
        } else {
            log.warn("⚠️ No TronGrid API key configured - Rate limited to 100 req/min");
        }
        
        return headers;
    }

    
    public boolean isValidTronAddress(String address) {
        return address != null && address.length() == 34 && address.startsWith("T");
    }

    
    public boolean requestFaucetTrx(String address) {
        try {


            log.info("🚰 Requesting faucet TRX for address: {} on Nile testnet", address);

            log.warn("Faucet functionality not implemented. Please use Nile testnet faucet manually.");
            return false;

        } catch (Exception e) {
            log.error("Error requesting faucet TRX", e);
            return false;
        }
    }

    
    public List<Map<String, Object>> getTransactionsInRangeOptimized(
            List<String> addresses, Long fromBlock, Long toBlock) {

        List<Map<String, Object>> allTransactions = new ArrayList<>();

        try {

            Set<String> addressSet = new HashSet<>();
            for (String addr : addresses) {

                addressSet.add(addr);
                addressSet.add(TronAddressUtil.base58ToHex(addr));
            }

            log.debug("Optimized scan: {} addresses, blocks {}-{}",
                addresses.size(), fromBlock, toBlock);

            long batchSize = 10; 
            for (long startBlock = fromBlock; startBlock <= toBlock; startBlock += batchSize) {
                long endBlock = Math.min(startBlock + batchSize - 1, toBlock);

                List<Map<String, Object>> blockTransactions =
                    getTransactionsFromBlockRange(startBlock, endBlock, addressSet);
                allTransactions.addAll(blockTransactions);
            }

            log.debug("Found {} transactions in optimized scan", allTransactions.size());

        } catch (Exception e) {
            log.error("Error in optimized transaction scanning", e);
        }

        return allTransactions;
    }

    
    private List<Map<String, Object>> getTransactionsFromBlockRange(
            long fromBlock, long toBlock, Set<String> targetAddresses) {

        List<Map<String, Object>> transactions = new ArrayList<>();

        try {

            String url = String.format("%s/v1/contracts/%s/events?event_name=Transfer&min_block_number=%d&max_block_number=%d&limit=200",
                tronApiUrl, usdtContractAddress, fromBlock, toBlock);

            HttpHeaders headers = createHeaders();
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Object dataObj = response.getBody().get("data");
                if (dataObj instanceof List) {
                    List<Map<String, Object>> events = (List<Map<String, Object>>) dataObj;

                    log.debug("TronGrid returned {} events for blocks {}-{}", events.size(), fromBlock, toBlock);

                    int skippedCount = 0;
                    for (Map<String, Object> event : events) {
                        Map<String, Object> result = (Map<String, Object>) event.get("result");
                        if (result != null) {
                            String toAddress = (String) result.get("to");
                            Long eventBlockNumber = ((Number) event.get("block_number")).longValue();

                            if (eventBlockNumber < fromBlock || eventBlockNumber > toBlock) {
                                skippedCount++;

                                if (skippedCount % 10 == 1) {
                                    log.debug("Skipping {} events from outside range {}-{} (showing every 10th)",
                                        skippedCount, fromBlock, toBlock);
                                }
                                continue;
                            }

                            if (targetAddresses.contains(toAddress)) {
                                String txId = (String) event.get("transaction_id");

                                if (!isTransactionSuccessful(txId)) {
                                    log.debug("Skipping failed transaction: {} in block {}", txId, eventBlockNumber);
                                    continue;
                                }

                                Map<String, Object> txData = new HashMap<>();
                                txData.put("transaction_id", txId);
                                txData.put("from", result.get("from"));
                                txData.put("to", toAddress);
                                txData.put("value", result.get("value"));
                                txData.put("block_number", eventBlockNumber);
                                txData.put("block_timestamp", event.get("block_timestamp"));
                                txData.put("token_info", Map.of("address", usdtContractAddress));

                                transactions.add(txData);
                                
                                log.debug("Found valid deposit: {} USDT to {} in block {} (SUCCESS verified)",
                                    new BigDecimal(result.get("value").toString()).divide(new BigDecimal("1000000")),
                                    toAddress, eventBlockNumber);
                            }
                        }
                    }

                    if (skippedCount > 0) {
                        log.debug("Total skipped {} events outside range {}-{}", skippedCount, fromBlock, toBlock);
                    }
                }
            } else {
                log.warn("TronGrid API returned error for blocks {}-{}: {}", 
                    fromBlock, toBlock, response.getStatusCode());
            }

        } catch (Exception e) {
            log.error("Error scanning block range {}-{}: {}", fromBlock, toBlock, e.getMessage(), e);
        }

        log.debug("Returning {} valid transactions for blocks {}-{}", transactions.size(), fromBlock, toBlock);
        return transactions;
    }

    
    private long getBlockTimestamp(long blockNumber) {

        long currentTime = System.currentTimeMillis();
        long currentBlock = getLatestBlockNumber();
        long blockDiff = currentBlock - blockNumber;
        return currentTime - (blockDiff * 3000); 
    }

    
    public String createTrxTransferTransaction(String fromAddress, String toAddress, BigDecimal amount) {
        try {
            log.info("Creating TRX transfer: {} TRX from {} to {}", amount, fromAddress, toAddress);

            BigInteger amountInSun = amount.multiply(new BigDecimal("1000000")).toBigInteger();

            Map<String, Object> request = new HashMap<>();
            request.put("owner_address", fromAddress);
            request.put("to_address", toAddress);
            request.put("amount", amountInSun.longValue());
            request.put("visible", true);

            String url = tronApiUrl + "/wallet/createtransaction";

            HttpHeaders headers = createHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Object rawDataObj = response.getBody().get("raw_data");
                if (rawDataObj != null) {

                    log.debug("TRX transaction created successfully");

                    ObjectMapper mapper = new ObjectMapper();
                    String transactionJson = mapper.writeValueAsString(response.getBody());

                    Map<String, Object> txMap = response.getBody();
                    if (!txMap.containsKey("raw_data_hex")) {
                        log.error("❌ CRITICAL: TRX Transaction missing raw_data_hex!");
                        log.error("Transaction response: {}", transactionJson);
                        throw new RuntimeException("TronGrid did not return raw_data_hex for TRX transaction");
                    }

                    String rawDataHex = (String) txMap.get("raw_data_hex");
                    log.info("✅ TRX Transaction created with raw_data_hex: {}", rawDataHex.substring(0, Math.min(32, rawDataHex.length())) + "...");

                    return transactionJson;
                } else {
                    log.error("❌ No raw_data in TronGrid TRX response: {}", response.getBody());
                }
            } else {
                log.error("❌ TronGrid TRX API error: {} - {}", response.getStatusCode(), response.getBody());
            }

        } catch (Exception e) {
            log.error("Error creating TRX transfer transaction", e);
        }
        return null;
    }

    
    private long calculateSafeFeeLimit(String fromAddress) {
        try {
            BigDecimal trxBalance = getTrxBalance(fromAddress);

            BigDecimal maxFeeInTrx = trxBalance.multiply(new BigDecimal("0.8"));

            if (maxFeeInTrx.compareTo(BigDecimal.ONE) < 0) {
                maxFeeInTrx = BigDecimal.ONE;
            } else if (maxFeeInTrx.compareTo(new BigDecimal("15")) > 0) {
                maxFeeInTrx = new BigDecimal("15");
            }

            long feeLimit = maxFeeInTrx.multiply(new BigDecimal("1000000")).longValue();

            log.debug("Calculated safe fee limit: {} TRX ({} sun) based on balance {} TRX",
                maxFeeInTrx, feeLimit, trxBalance);

            return feeLimit;

        } catch (Exception e) {
            log.warn("Could not calculate safe fee limit, using default: {}", e.getMessage());
            return 8_000_000; 
        }
    }

    
    public String createUsdtTransferTransaction(String fromAddress, String toAddress, BigDecimal amount) {
        try {
            log.info("Creating USDT transfer: {} USDT from {} to {}", amount, fromAddress, toAddress);

            BigDecimal trxBalance = getTrxBalance(fromAddress);
            if (trxBalance.compareTo(new BigDecimal("1")) < 0) {
                log.warn("⚠️ Low TRX balance ({} TRX) for USDT transfer from {}", trxBalance, fromAddress);
            }

            BigInteger amountInWei = amount.multiply(new BigDecimal("1000000")).toBigInteger();

            String methodId = "a9059cbb";

            String toAddressHex = TronAddressUtil.base58ToHex(toAddress);
            if (toAddressHex.startsWith("0x")) {
                toAddressHex = toAddressHex.substring(2);
            }

            if (toAddressHex.length() == 42) {
                toAddressHex = toAddressHex.substring(2); 
            }

            String paddedToAddress = String.format("%64s", toAddressHex).replace(' ', '0');

            String amountHex = amountInWei.toString(16);
            String paddedAmount = String.format("%64s", amountHex).replace(' ', '0');

            String parameter = paddedToAddress + paddedAmount;

            long safeFeeLimit = calculateSafeFeeLimit(fromAddress);

            Map<String, Object> request = new HashMap<>();
            request.put("owner_address", fromAddress);
            request.put("contract_address", usdtContractAddress);
            request.put("function_selector", "transfer(address,uint256)");
            request.put("parameter", parameter);
            request.put("fee_limit", safeFeeLimit);
            request.put("call_value", 0);
            request.put("visible", true);

            String url = tronApiUrl + "/wallet/triggersmartcontract";

            HttpHeaders headers = createHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Object transactionObj = response.getBody().get("transaction");
                if (transactionObj != null) {
                    log.debug("USDT transaction created successfully with fee limit: {} TRX",
                        safeFeeLimit / 1_000_000.0);

                    ObjectMapper mapper = new ObjectMapper();
                    String transactionJson = mapper.writeValueAsString(transactionObj);

                    Map<String, Object> txMap = (Map<String, Object>) transactionObj;
                    if (!txMap.containsKey("raw_data_hex")) {
                        log.error("❌ CRITICAL: Transaction missing raw_data_hex!");
                        log.error("Transaction response: {}", transactionJson);
                        throw new RuntimeException("TronGrid did not return raw_data_hex - cannot sign transaction");
                    }

                    String rawDataHex = (String) txMap.get("raw_data_hex");
                    log.info("✅ Transaction created with raw_data_hex: {}", rawDataHex.substring(0, Math.min(32, rawDataHex.length())) + "...");

                    return transactionJson;
                } else {
                    log.error("❌ No transaction object in TronGrid response: {}", response.getBody());
                }
            } else {
                log.error("❌ TronGrid API error: {} - {}", response.getStatusCode(), response.getBody());
            }

        } catch (Exception e) {
            log.error("Error creating USDT transfer transaction", e);
        }
        return null;
    }

    
    public String signTransaction(String rawTransactionJson, String privateKeyHex) {
        try {
            log.debug("Signing transaction with Tron standard signer");
            return TronTransactionSigner.signTransaction(rawTransactionJson, privateKeyHex);

        } catch (Exception e) {
            log.error("❌ Failed to sign transaction: {}", e.getMessage());
            throw new RuntimeException("Transaction signing failed: " + e.getMessage(), e);
        }
    }

    
    public String addressToHex(String address) {
        try {

            if (!address.startsWith("T")) {
                throw new IllegalArgumentException("Invalid TRON address format");
            }

            byte[] decoded = org.bitcoinj.core.Base58.decode(address);

            byte[] addressBytes = java.util.Arrays.copyOfRange(decoded, 0, decoded.length - 4);

            String hex = org.bouncycastle.util.encoders.Hex.toHexString(addressBytes);
            if (hex.startsWith("41")) {
                hex = hex.substring(2); 
            }

            while (hex.length() < 40) {
                hex = "0" + hex;
            }

            return "0x" + hex;

        } catch (Exception e) {
            log.error("Failed to convert address {} to hex", address, e);
            throw new RuntimeException("Address conversion failed: " + e.getMessage());
        }
    }
}
