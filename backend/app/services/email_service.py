"""
Aptora — Email Service
SMTP email sending, HTML template generation, and MIME PDF attachment support.
"""
import os
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication

from app.core.config import settings

logger = logging.getLogger("backend")

SMTP_HOST = settings.MAIL_SERVER
SMTP_PORT = settings.MAIL_PORT
SMTP_USER = settings.MAIL_USERNAME
SMTP_PASSWORD = settings.MAIL_PASSWORD

EMAIL_COMMON_STYLES = """
    body {
      background-color: #FAF9F6;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 32px 16px;
      color: #0F172A;
      text-align: left;
      -webkit-font-smoothing: antialiased;
    }
    .email-container {
      max-width: 540px;
      margin: 0 auto;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 24px;
      padding: 36px 32px;
      box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.04);
    }
    .header-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 24px;
    }
    .logo-text {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #0F172A;
      font-family: 'Inter', system-ui, sans-serif;
    }
    .badge-pill {
      display: inline-block;
      background: #ECFDF5;
      border: 1px solid #D1FAE5;
      border-radius: 9999px;
      padding: 5px 16px;
      font-size: 11px;
      color: #084C38;
      font-weight: 800;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 22px;
      font-weight: 800;
      color: #0F172A;
      margin: 0 0 12px 0;
      line-height: 1.3;
      letter-spacing: -0.3px;
    }
    .body-text {
      color: #475569;
      line-height: 1.6;
      font-size: 14px;
      margin-bottom: 24px;
      font-weight: 500;
    }
    .footer {
      font-size: 11px;
      color: #94A3B8;
      margin-top: 36px;
      border-top: 1px solid #F1F5F9;
      padding-top: 20px;
      text-align: center;
      font-weight: 600;
    }
"""

def generate_logo_header_html() -> str:
    return """<div class="header-logo">
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle;">
        <path d="M16 3L4 27H11.5L16 17.5L20.5 27H28L16 3Z" fill="#084c38" />
        <path d="M16 11L12.5 19H19.5L16 11Z" fill="#ffffff" />
      </svg>
      <span class="logo-text">Aptora</span>
    </div>"""

def generate_otp_email_html(name: str, otp: str):
    otp_boxes = "".join([
        f'<div style="display: inline-block; width: 42px; height: 50px; line-height: 50px; text-align: center; background: #ECFDF5; border: 2px solid #084C38; border-radius: 12px; font-size: 26px; font-weight: 900; color: #084C38; margin: 0 4px; box-shadow: 0 2px 8px rgba(8,76,56,0.08);">{digit}</div>'
        for digit in otp
    ])

    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to Aptora</title>
  <style>{EMAIL_COMMON_STYLES}</style>
</head>
<body>
  <div class="email-container">
    {generate_logo_header_html()}

    <div style="text-align: center;">
      <div class="badge-pill">🎉 Verification Required</div>
    </div>

    <h1>Welcome, {name}!</h1>

    <div style="color: #084C38; font-size: 15px; font-weight: 700; margin-bottom: 16px; line-height: 1.5; text-align: center;">
      You are officially locked and loaded to crack your dream exams! 🚀
    </div>

    <p class="body-text">
      We are thrilled to welcome you to the Aptora platform. Your AI companion is ready to transform your study materials into interactive summaries, practice question sets, and custom mock tests. 
      <br><br>
      To finalize your verification and jump straight into your dashboard, copy this secure OTP code:
    </p>

    <div style="text-align: center; margin: 28px 0;">
      {otp_boxes}
    </div>

    <p style="font-size: 12px; color: #64748B; font-weight: 500; text-align: center;">
      This verification code is valid for 5 minutes. If you did not request this verification, you can safely ignore this email.
    </p>

    <div class="footer">
      &copy; 2026 Aptora. Smart educational platform powered by Artificial Intelligence.
    </div>
  </div>
</body>
</html>"""

def send_real_email(recipient_email: str, subject: str, html_content: str):
    if not SMTP_USER or not SMTP_PASSWORD:
        logger.info("Real SMTP credentials not configured. Skipping internet email transmission (saving to last_email.html instead).")
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = SMTP_USER
        msg["To"] = recipient_email
        
        part = MIMEText(html_content, "html", "utf-8")
        msg.attach(part)
        
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, recipient_email, msg.as_string())
        logger.info(f"Real email successfully sent to {recipient_email} via SMTP!")
        return True
    except Exception as e:
        logger.warning(f"Failed to transmit email to {recipient_email} via SMTP: {e}")
        return False

def send_email_with_pdf_attachment(
    recipient_email: str,
    subject: str,
    html_content: str,
    pdf_bytes: bytes,
    filename: str = "Aptora_Invoice.pdf"
) -> bool:
    """
    Sends an HTML email with a PDF file attached via SMTP.
    """
    if not SMTP_USER or not SMTP_PASSWORD:
        logger.info(f"Real SMTP credentials not configured. Skipping internet email transmission of PDF {filename}.")
        return False

    try:
        msg = MIMEMultipart("mixed")
        msg["Subject"] = subject
        msg["From"] = SMTP_USER
        msg["To"] = recipient_email

        # Attach HTML body
        html_part = MIMEText(html_content, "html", "utf-8")
        msg.attach(html_part)

        # Attach PDF document
        pdf_attachment = MIMEApplication(pdf_bytes, _subtype="pdf")
        pdf_attachment.add_header("Content-Disposition", "attachment", filename=filename)
        msg.attach(pdf_attachment)

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, recipient_email, msg.as_string())

        logger.info(f"Real invoice email with PDF attachment ({filename}) sent to {recipient_email} via SMTP!")
        return True
    except Exception as e:
        logger.warning(f"Failed to transmit invoice email with PDF attachment to {recipient_email} via SMTP: {e}")
        return False

def generate_account_deletion_email_html(name: str, otp: str):
    otp_boxes = "".join([
        f'<div style="display: inline-block; width: 42px; height: 50px; line-height: 50px; text-align: center; background: #FEF2F2; border: 2px solid #E11D48; border-radius: 12px; font-size: 26px; font-weight: 900; color: #E11D48; margin: 0 4px;">{digit}</div>'
        for digit in otp
    ])

    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Aptora - Account Deletion Verification</title>
  <style>{EMAIL_COMMON_STYLES}</style>
</head>
<body>
  <div class="email-container" style="border-color: #FECACA;">
    {generate_logo_header_html()}

    <div style="text-align: center;">
      <div class="badge-pill" style="background: #FEF2F2; border-color: #FECACA; color: #E11D48;">⚠️ Security Action</div>
    </div>

    <h1 style="color: #991B1B;">Account Deletion Request</h1>

    <p class="body-text">
      Hi <strong>{name}</strong>, we received a request to permanently delete your Aptora account.
      This action is <strong>irreversible</strong> and will erase all your data including progress, mock test results, notes, and profile information.
    </p>

    <div style="text-align: center; margin: 24px 0;">
      {otp_boxes}
    </div>

    <div style="background: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 16px; padding: 14px 18px; font-size: 12px; color: #991B1B; font-weight: 600; line-height: 1.5; margin-bottom: 24px;">
      ⚠️ <strong>WARNING:</strong> Once verified, your account and ALL associated data will be permanently deleted and cannot be recovered. If you did not request this, please ignore this email and secure your account immediately.
    </div>

    <p style="font-size: 12px; color: #64748B; font-weight: 500; text-align: center;">
      This code is valid for 10 minutes.
    </p>

    <div class="footer">
      &copy; 2026 Aptora. This is an automated security notification.
    </div>
  </div>
</body>
</html>"""
