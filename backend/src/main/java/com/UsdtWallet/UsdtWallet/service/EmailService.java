package com.UsdtWallet.UsdtWallet.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final Optional<JavaMailSender> mailSender;

    @Value("${app.mail.from:noreply@example.com}")
    private String fromAddress;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.brand.name:USDT Wallet}")
    private String brandName;

    private void sendHtmlEmail(String toEmail, String subject, String htmlBody, String textFallback) {
        if (mailSender.isEmpty()) {
            log.warn("No JavaMailSender configured. Skipping email to {} with subject '{}'.", toEmail, subject);
            return;
        }
        try {
            MimeMessage mimeMessage = mailSender.get().createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(textFallback != null ? textFallback : htmlBody.replaceAll("<[^>]*>", ""), htmlBody);
            mailSender.get().send(mimeMessage);
        } catch (Exception e) {
            log.warn("HTML email send failed, falling back to plaintext: {}", e.getMessage());
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromAddress);
                message.setTo(toEmail);
                message.setSubject(subject);
                message.setText(textFallback != null ? textFallback : htmlBody.replaceAll("<[^>]*>", ""));
                mailSender.get().send(message);
            } catch (Exception ex) {
                log.error("Failed to send fallback plaintext email to {}: {}", toEmail, ex.getMessage(), ex);
            }
        }
    }

    public void sendPasswordResetEmail(String toEmail, String token) {
        if (mailSender.isEmpty()) {
            log.warn("No JavaMailSender configured. Skipping password reset email to {}.", toEmail);
            return;
        }
        try {
            String encodedToken = URLEncoder.encode(token, StandardCharsets.UTF_8);
            String resetLink = frontendUrl.replaceAll("/$", "") + "/reset-password?token=" + encodedToken;

            String subject = "Reset your " + brandName + " password";

            String html = "" +
                "<div style=\"font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a;\">" +
                "  <h2 style=\"margin:0 0 16px;\">" + brandName + "</h2>" +
                "  <p>We received a request to reset your password.</p>" +
                "  <p>This link will expire in <strong>15 minutes</strong>.</p>" +
                "  <p style=\"margin:24px 0;\"><a href=\"" + resetLink + "\" style=\"background:#2563eb;color:#fff;text-decoration:none;padding:12px 16px;border-radius:6px;display:inline-block;\">Reset password</a></p>" +
                "  <p>If the button doesn’t work, copy and paste this URL into your browser:</p>" +
                "  <p style=\"word-break:break-all;color:#334155\">" + resetLink + "</p>" +
                "  <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:24px 0\"/>" +
                "  <p style=\"color:#64748b;font-size:12px\">If you didn’t request this, you can ignore this email.</p>" +
                "</div>";

            String text = "We received a request to reset your password.\n" +
                "This link will expire in 15 minutes.\n\n" + resetLink + "\n\n" +
                "If you didn’t request this, you can ignore this email.";

            sendHtmlEmail(toEmail, subject, html, text);
            log.info("Password reset email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage(), e);
        }
    }

    public void sendPasswordChangedEmail(String toEmail) {
        if (mailSender.isEmpty()) {
            log.warn("No JavaMailSender configured. Skipping password changed email to {}.", toEmail);
            return;
        }
        try {
            String subject = brandName + ": Your password was changed";
            String html = "" +
                "<div style=\"font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a;\">" +
                "  <h2 style=\"margin:0 0 16px;\">" + brandName + "</h2>" +
                "  <p>Your account password was just changed.</p>" +
                "  <p style=\"color:#64748b\">If this wasn’t you, please contact support immediately.</p>" +
                "</div>";

            String text = brandName + ": Your account password was just changed. If this wasn’t you, please contact support immediately.";

            sendHtmlEmail(toEmail, subject, html, text);
            log.info("Password changed email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send password changed email to {}: {}", toEmail, e.getMessage(), e);
        }
    }
    /**
     * FR-01: Email verification - send verification link
     */
    public void sendEmailVerificationEmail(String toEmail, String token) {
        if (mailSender.isEmpty()) {
            log.warn("No JavaMailSender configured. Skipping email verification email to {}.", toEmail);
            return;
        }
        try {
            String encodedToken = URLEncoder.encode(token, StandardCharsets.UTF_8);
            String verifyLink = frontendUrl.replaceAll("/$", "") + "/verify-email?token=" + encodedToken;

            String subject = "Verify your " + brandName + " email address";

            String html = "" +
                "<div style=\"font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a;\">" +
                "  <h2 style=\"margin:0 0 16px;\">" + brandName + "</h2>" +
                "  <p>Thank you for registering! Please verify your email address to complete your registration.</p>" +
                "  <p>This link will expire in <strong>24 hours</strong>.</p>" +
                "  <p style=\"margin:24px 0;\"><a href=\"" + verifyLink + "\" style=\"background:#16a34a;color:#fff;text-decoration:none;padding:12px 16px;border-radius:6px;display:inline-block;\">Verify Email</a></p>" +
                "  <p>If the button does not work, copy and paste this URL into your browser:</p>" +
                "  <p style=\"word-break:break-all;color:#334155\">" + verifyLink + "</p>" +
                "  <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:24px 0\"/>" +
                "  <p style=\"color:#64748b;font-size:12px\">If you did not create an account, you can ignore this email.</p>" +
                "</div>";

            String text = "Thank you for registering!\n" +
                "Please verify your email address by clicking this link:\n\n" + verifyLink + "\n\n" +
                "This link will expire in 24 hours.\n\n" +
                "If you did not create an account, you can ignore this email.";

            sendHtmlEmail(toEmail, subject, html, text);
            log.info("Email verification email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send email verification email to {}: {}", toEmail, e.getMessage(), e);
        }
    }

    /**
     * FR-12: Transaction notification - Deposit confirmed
     */
    public void sendDepositConfirmedEmail(String toEmail, String amount, String txHash) {
        if (mailSender.isEmpty()) {
            log.warn("No JavaMailSender configured. Skipping deposit confirmed email to {}.", toEmail);
            return;
        }
        try {
            String subject = brandName + ": Deposit Confirmed";

            String html = "" +
                "<div style=\"font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a;\">" +
                "  <h2 style=\"margin:0 0 16px;\">" + brandName + "</h2>" +
                "  <p style=\"color:#16a34a;font-size:18px;\">Deposit Confirmed</p>" +
                "  <p>Your deposit of <strong>" + amount + " USDT</strong> has been confirmed and credited to your account.</p>" +
                "  <p style=\"color:#64748b;font-size:14px;\">Transaction: " + txHash + "</p>" +
                "  <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:24px 0\"/>" +
                "  <p style=\"color:#64748b;font-size:12px\">Thank you for using " + brandName + "!</p>" +
                "</div>";

            String text = "Deposit Confirmed\n\n" +
                "Your deposit of " + amount + " USDT has been confirmed and credited to your account.\n\n" +
                "Transaction: " + txHash;

            sendHtmlEmail(toEmail, subject, html, text);
            log.info("Deposit confirmed email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send deposit confirmed email to {}: {}", toEmail, e.getMessage(), e);
        }
    }

    /**
     * FR-12: Transaction notification - Withdrawal processed
     */
    public void sendWithdrawalProcessedEmail(String toEmail, String amount, String address, String txHash) {
        if (mailSender.isEmpty()) {
            log.warn("No JavaMailSender configured. Skipping withdrawal processed email to {}.", toEmail);
            return;
        }
        try {
            String subject = brandName + ": Withdrawal Processed";

            String html = "" +
                "<div style=\"font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a;\">" +
                "  <h2 style=\"margin:0 0 16px;\">" + brandName + "</h2>" +
                "  <p style=\"color:#2563eb;font-size:18px;\">Withdrawal Processed</p>" +
                "  <p>Your withdrawal of <strong>" + amount + " USDT</strong> has been processed.</p>" +
                "  <p><strong>To address:</strong> " + address + "</p>" +
                "  <p style=\"color:#64748b;font-size:14px;\">Transaction: " + (txHash != null ? txHash : "Processing") + "</p>" +
                "  <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:24px 0\"/>" +
                "  <p style=\"color:#64748b;font-size:12px\">Thank you for using " + brandName + "!</p>" +
                "</div>";

            String text = "Withdrawal Processed\n\n" +
                "Your withdrawal of " + amount + " USDT has been processed.\n" +
                "To address: " + address + "\n" +
                "Transaction: " + (txHash != null ? txHash : "Processing");

            sendHtmlEmail(toEmail, subject, html, text);
            log.info("Withdrawal processed email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send withdrawal processed email to {}: {}", toEmail, e.getMessage(), e);
        }
    }

    /**
     * FR-12: Transaction notification - Milestone payment released
     */
    public void sendMilestonePaymentEmail(String toEmail, String projectName, String milestoneName, String amount) {
        if (mailSender.isEmpty()) {
            log.warn("No JavaMailSender configured. Skipping milestone payment email to {}.", toEmail);
            return;
        }
        try {
            String subject = brandName + ": Milestone Payment Released";

            String html = "" +
                "<div style=\"font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a;\">" +
                "  <h2 style=\"margin:0 0 16px;\">" + brandName + "</h2>" +
                "  <p style=\"color:#16a34a;font-size:18px;\">Payment Released</p>" +
                "  <p>Payment has been released for:</p>" +
                "  <p><strong>Project:</strong> " + projectName + "</p>" +
                "  <p><strong>Milestone:</strong> " + milestoneName + "</p>" +
                "  <p><strong>Amount:</strong> " + amount + " Points</p>" +
                "  <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:24px 0\"/>" +
                "  <p style=\"color:#64748b;font-size:12px\">The amount has been credited to your account balance.</p>" +
                "</div>";

            String text = "Milestone Payment Released\n\n" +
                "Payment has been released for:\n" +
                "Project: " + projectName + "\n" +
                "Milestone: " + milestoneName + "\n" +
                "Amount: " + amount + " Points\n\n" +
                "The amount has been credited to your account balance.";

            sendHtmlEmail(toEmail, subject, html, text);
            log.info("Milestone payment email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send milestone payment email to {}: {}", toEmail, e.getMessage(), e);
        }
    }

    /**
     * FR-12: Transaction notification - Escrow funded
     */
    public void sendEscrowFundedEmail(String toEmail, String projectName, String amount) {
        if (mailSender.isEmpty()) {
            log.warn("No JavaMailSender configured. Skipping escrow funded email to {}.", toEmail);
            return;
        }
        try {
            String subject = brandName + ": Project Escrow Funded";

            String html = "" +
                "<div style=\"font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a;\">" +
                "  <h2 style=\"margin:0 0 16px;\">" + brandName + "</h2>" +
                "  <p style=\"color:#2563eb;font-size:18px;\">Escrow Funded</p>" +
                "  <p>The escrow for your project has been funded:</p>" +
                "  <p><strong>Project:</strong> " + projectName + "</p>" +
                "  <p><strong>Amount:</strong> " + amount + " Points</p>" +
                "  <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:24px 0\"/>" +
                "  <p style=\"color:#64748b;font-size:12px\">The freelancer can now start working on the project.</p>" +
                "</div>";

            String text = "Project Escrow Funded\n\n" +
                "The escrow for your project has been funded:\n" +
                "Project: " + projectName + "\n" +
                "Amount: " + amount + " Points\n\n" +
                "The freelancer can now start working on the project.";

            sendHtmlEmail(toEmail, subject, html, text);
            log.info("Escrow funded email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send escrow funded email to {}: {}", toEmail, e.getMessage(), e);
        }
    }}
