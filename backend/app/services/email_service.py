"""
ExamForge AI — Email Service
SMTP email sending and HTML template generation.
Extracted from utils/email.py into the services layer.
"""
import os
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.core.config import settings

logger = logging.getLogger("backend")

SMTP_HOST = settings.MAIL_SERVER
SMTP_PORT = settings.MAIL_PORT
SMTP_USER = settings.MAIL_USERNAME
SMTP_PASSWORD = settings.MAIL_PASSWORD

def generate_otp_email_html(name: str, otp: str):
    # Split the OTP code into separate visual boxes
    otp_boxes = "".join([
        f'<div style="display: inline-block; width: 44px; height: 52px; line-height: 52px; text-align: center; background: #F9FAFB; border: 2px solid #6D4AFF; border-radius: 12px; font-size: 28px; font-weight: 800; color: #6D4AFF; margin: 0 5px; box-shadow: 0 4px 10px rgba(109,74,255,0.08);">{digit}</div>' 
        for digit in otp
    ])

    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to ExamForge AI - Success Intercepted!</title>
  <style>
    body {{
      background-color: transparent;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 40px 20px;
      color: #374151;
      text-align: center;
    }}
    .email-container {{
      max-width: 540px;
      margin: 0 auto;
      background: #FFFFFF;
      border: 1.5px solid #E5E7EB;
      border-radius: 24px;
      padding: 40px 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
      position: relative;
    }}
    .logo-container {{
      margin-bottom: 25px;
    }}
    .logo {{
      font-size: 30px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #111827;
    }}
    .logo-ai {{
      color: #6D4AFF;
    }}
    h1 {{
      font-size: 26px;
      margin-bottom: 12px;
      font-weight: 900;
      color: #111827;
      letter-spacing: -0.5px;
    }}
    .cheer-message {{
      color: #6D4AFF;
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 20px;
      line-height: 1.5;
    }}
    .body-text {{
      color: #4B5563;
      line-height: 1.6;
      font-size: 14.5px;
      margin-bottom: 30px;
      font-weight: 500;
    }}
    .otp-wrapper {{
      margin: 35px 0;
      text-align: center;
    }}
    .cheer-badge {{
      display: inline-flex;
      background: rgba(16, 185, 129, 0.08);
      border: 1.5px solid rgba(16, 185, 129, 0.2);
      border-radius: 50px;
      padding: 6px 18px;
      font-size: 13px;
      color: #059669;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 20px;
    }}
    .footer {{
      font-size: 11.5px;
      color: #9CA3AF;
      margin-top: 40px;
      border-top: 1.5px solid #F3F4F6;
      padding-top: 20px;
      font-weight: 600;
    }}
  </style>
</head>
<body>
  <div class="email-container">
    <!-- SVG Geometric Node Network (Three.js geometry layout style) -->
    <svg width="100%" height="80" viewBox="0 0 400 80" style="margin-bottom: 10px; overflow: visible;">
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#6D4AFF" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#6D4AFF" stop-opacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="40" r="60" fill="url(#glow)" />
      
      <!-- Connection Lines -->
      <line x1="60" y1="45" x2="140" y2="25" stroke="#6D4AFF" stroke-width="2" stroke-dasharray="5 3" />
      <line x1="140" y1="25" x2="200" y2="55" stroke="#8B5CF6" stroke-width="2.5" />
      <line x1="200" y1="55" x2="260" y2="20" stroke="#10B981" stroke-width="2" stroke-dasharray="4 4" />
      <line x1="260" y1="20" x2="340" y2="45" stroke="#4F46E5" stroke-width="2" />
      <line x1="140" y1="25" x2="260" y2="20" stroke="#4F46E5" stroke-width="1.2" opacity="0.6" />
      <line x1="60" y1="45" x2="200" y2="55" stroke="#6D4AFF" stroke-width="1.2" opacity="0.6" />
      
      <!-- Animated / Pulsing Nodes -->
      <circle cx="60" cy="45" r="6" fill="#6D4AFF" />
      <circle cx="140" cy="25" r="8" fill="#8B5CF6" />
      <circle cx="200" cy="55" r="7" fill="#10B981" />
      <circle cx="260" cy="20" r="9" fill="#4F46E5" />
      <circle cx="340" cy="45" r="6" fill="#6D4AFF" />
    </svg>

    <div class="logo-container" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle;">
        <rect width="32" height="32" rx="10" fill="#6D4AFF"/>
        <path d="M17 6L8 18H15L13 26L24 13H16L17 6Z" fill="white"/>
      </svg>
      <span class="logo" style="font-size: 26px; font-weight: 900; color: #111827;">Exam<span class="logo-ai" style="color: #6D4AFF;">Forge-AI</span></span>
    </div>
    
    <div class="cheer-badge">🎉 Celebration! Success Intercepted!</div>
    
    <h1>Welcome, {name}!</h1>
    
    <div class="cheer-message">
      You are officially locked and loaded to crack your dream exams! 🚀
    </div>
    
    <p class="body-text">
      We are absolutely thrilled to welcome you to the ExamForge AI community. Your personalized AI companion is ready to transform your study materials into interactive summaries, practice question sets, and custom mock tests. 
      <br><br>
      To finalize your verification and jump straight into your dashboard, copy this secure OTP code:
    </p>
    
    <div class="otp-wrapper">
      {otp_boxes}
    </div>
    
    <p style="font-size: 13px; color: #6B7280; margin-bottom: 0; font-weight: 500;">
      This code is valid for 5 minutes. If you did not request this verification, you can safely ignore this mail.
    </p>
    
    <div class="footer">
      &copy; 2026 ExamForge AI. Smart educational ecosystems powered by Artificial Intelligence.
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

def generate_account_deletion_email_html(name: str, otp: str):
    otp_boxes = "".join([
        f'<div style="display: inline-block; width: 44px; height: 52px; line-height: 52px; text-align: center; background: #FEF2F2; border: 2px solid #DC2626; border-radius: 12px; font-size: 28px; font-weight: 800; color: #DC2626; margin: 0 5px; box-shadow: 0 4px 10px rgba(220,38,38,0.08);">{digit}</div>'
        for digit in otp
    ])

    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ExamForge AI - Account Deletion Verification</title>
  <style>
    body {{
      background-color: transparent;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 40px 20px;
      color: #374151;
      text-align: center;
    }}
    .email-container {{
      max-width: 540px;
      margin: 0 auto;
      background: #FFFFFF;
      border: 1.5px solid #FCA5A5;
      border-radius: 24px;
      padding: 40px 30px;
      box-shadow: 0 10px 30px rgba(220, 38, 38, 0.08);
    }}
    .logo {{
      font-size: 30px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #111827;
      margin-bottom: 25px;
    }}
    .logo-ai {{
      color: #DC2626;
    }}
    .warning-badge {{
      display: inline-flex;
      background: rgba(220, 38, 38, 0.08);
      border: 1.5px solid rgba(220, 38, 38, 0.2);
      border-radius: 50px;
      padding: 6px 18px;
      font-size: 13px;
      color: #DC2626;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 20px;
    }}
    h1 {{
      font-size: 24px;
      margin-bottom: 12px;
      font-weight: 900;
      color: #991B1B;
    }}
    .body-text {{
      color: #4B5563;
      line-height: 1.6;
      font-size: 14px;
      margin-bottom: 30px;
      font-weight: 500;
    }}
    .otp-wrapper {{
      margin: 35px 0;
    }}
    .warning-box {{
      background: #FEF2F2;
      border: 1.5px solid #FECACA;
      border-radius: 16px;
      padding: 16px;
      margin: 20px 0;
      font-size: 13px;
      color: #991B1B;
      font-weight: 600;
      line-height: 1.5;
    }}
    .footer {{
      font-size: 11.5px;
      color: #9CA3AF;
      margin-top: 40px;
      border-top: 1.5px solid #F3F4F6;
      padding-top: 20px;
      font-weight: 600;
    }}
  </style>
</head>
<body>
  <div class="email-container">
    <div class="logo" style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 25px;">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle;">
        <rect width="32" height="32" rx="10" fill="#DC2626"/>
        <path d="M17 6L8 18H15L13 26L24 13H16L17 6Z" fill="white"/>
      </svg>
      <span style="font-size: 26px; font-weight: 900; color: #111827;">Exam<span class="logo-ai" style="color: #DC2626;">Forge-AI</span></span>
    </div>
    <div class="warning-badge">⚠️ Account Deletion Request</div>
    <h1>Permanent Account Deletion</h1>
    <p class="body-text">
      Hi <strong>{name}</strong>, we received a request to permanently delete your ExamForge AI account.
      This action is <strong>irreversible</strong> and will erase all your data including progress, mock test results, notes, and profile information.
    </p>
    <div class="otp-wrapper">
      {otp_boxes}
    </div>
    <div class="warning-box">
      ⚠️ <strong>WARNING:</strong> Once verified, your account and ALL associated data will be permanently deleted and cannot be recovered. If you did not request this, please ignore this email and secure your account immediately.
    </div>
    <p style="font-size: 13px; color: #6B7280; font-weight: 500;">
      This code is valid for 10 minutes.
    </p>
    <div class="footer">
      &copy; 2026 ExamForge AI. This is an automated security notification.
    </div>
  </div>
</body>
</html>"""
