package com.archiform.service;

import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Value("${app.sendgrid.api-key}")
    private String apiKey;

    @Value("${app.sendgrid.from-email}")
    private String fromEmail;

    @Value("${app.sendgrid.from-name}")
    private String fromName;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public void sendInvitationEmail(String toEmail, String toName,
                                     String firmName, String inviterName,
                                     String token) {
        String inviteUrl = frontendUrl + "/auth/accept-invite?token=" + token;

        String htmlBody = buildInvitationEmail(
                toName, firmName, inviterName, inviteUrl);

        sendEmail(
                toEmail,
                toName != null ? toName : toEmail,
                "You've been invited to join " + firmName + " on Archiform",
                htmlBody
        );
    }

    public void sendEmail(String toEmail, String toName,
                           String subject, String htmlBody) {
        if (apiKey.equals("SG.placeholder")) {
            log.info("=== EMAIL (SendGrid not configured) ===");
            log.info("To: {} <{}>", toName, toEmail);
            log.info("Subject: {}", subject);
            log.info("Body preview: {}",
                    htmlBody.replaceAll("<[^>]*>", "").substring(0, Math.min(200, htmlBody.length())));
            log.info("==========================================");
            return;
        }

        try {
            Email from = new Email(fromEmail, fromName);
            Email to = new Email(toEmail, toName);
            Content content = new Content("text/html", htmlBody);
            Mail mail = new Mail(from, subject, to, content);

            SendGrid sg = new SendGrid(apiKey);
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sg.api(request);
            log.info("Email sent to {} — status: {}", toEmail, response.getStatusCode());
        } catch (IOException e) {
            log.error("Failed to send email to {}: {}", toEmail, e.getMessage());
        }
    }

    private String buildInvitationEmail(String name, String firmName,
                                         String inviterName, String inviteUrl) {
        String displayName = name != null ? name : "there";
        return """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>You're invited to Archiform</title>
            </head>
            <body style="margin:0;padding:0;background:#f4f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f4f5f9;padding:40px 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                      
                      <!-- Header -->
                      <tr>
                        <td style="background:#0f172a;padding:32px 40px;">
                          <table width="100%%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td>
                                <div style="display:inline-flex;align-items:center;gap:10px;">
                                  <div style="width:36px;height:36px;background:#6c5ce7;border-radius:8px;display:inline-block;"></div>
                                  <span style="color:#ffffff;font-size:20px;font-weight:700;vertical-align:middle;margin-left:10px;">Archiform</span>
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Body -->
                      <tr>
                        <td style="padding:40px;">
                          <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#0f172a;">
                            You're invited! 🎉
                          </h1>
                          <p style="margin:0 0 24px;color:#64748b;font-size:16px;line-height:1.6;">
                            Hi %s,<br><br>
                            <strong>%s</strong> has invited you to join <strong>%s</strong> on Archiform — the project management platform built for architecture and engineering firms.
                          </p>

                          <!-- Invite box -->
                          <div style="background:#f8f7ff;border:2px solid #e0ddff;border-radius:12px;padding:24px;margin-bottom:32px;">
                            <p style="margin:0 0 4px;font-size:13px;color:#6c5ce7;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
                              You're joining
                            </p>
                            <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">%s</p>
                          </div>

                          <!-- CTA Button -->
                          <div style="text-align:center;margin-bottom:32px;">
                            <a href="%s"
                               style="display:inline-block;background:#6c5ce7;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:16px;font-weight:600;">
                              Accept Invitation →
                            </a>
                          </div>

                          <p style="margin:0 0 8px;color:#94a3b8;font-size:13px;text-align:center;">
                            This invitation expires in 7 days.
                          </p>
                          <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center;">
                            Or copy this link: <a href="%s" style="color:#6c5ce7;">%s</a>
                          </p>
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;">
                          <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center;">
                            Archiform · Project Management for A&E Firms<br>
                            If you didn't expect this invitation, you can safely ignore this email.
                          </p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """.formatted(displayName, inviterName, firmName,
                         firmName, inviteUrl, inviteUrl, inviteUrl);
    }
}