import os
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger("backend")

SMTP_HOST = os.getenv("MAIL_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("MAIL_PORT", "587"))
SMTP_USER = os.getenv("MAIL_USERNAME", "")
SMTP_PASSWORD = os.getenv("MAIL_PASSWORD", "")

# Common CSS styles for Aptora email templates
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

def generate_otp_email_html(name: str, otp: str) -> str:
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

    <p class="body-text">
      You are one step away from launching your personalized AI study roadmap. Use the 6-digit verification code below to confirm your account and access your Aptora study cockpit:
    </p>

    <div style="text-align: center; margin: 28px 0;">
      {otp_boxes}
    </div>

    <p style="font-size: 12px; color: #64748B; font-weight: 500; text-align: center;">
      This verification code is valid for 5 minutes.
    </p>

    <div class="footer">
      &copy; 2026 Aptora. Smart educational platform powered by Artificial Intelligence.
    </div>
  </div>
</body>
</html>"""

def generate_password_reset_email_html(name: str, otp: str) -> str:
    otp_boxes = "".join([
      f'<div style="display: inline-block; width: 42px; height: 50px; line-height: 50px; text-align: center; background: #ECFDF5; border: 2px solid #084C38; border-radius: 12px; font-size: 26px; font-weight: 900; color: #084C38; margin: 0 4px; box-shadow: 0 2px 8px rgba(8,76,56,0.08);">{digit}</div>'
      for digit in otp
    ])

    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Password Reset Request - Aptora</title>
  <style>{EMAIL_COMMON_STYLES}</style>
</head>
<body>
  <div class="email-container">
    {generate_logo_header_html()}

    <div style="text-align: center;">
      <div class="badge-pill">🔒 Password Security</div>
    </div>

    <h1>Reset Your Password</h1>

    <p class="body-text">
      Hi {name}, we received a request to reset your Aptora password. Enter this secure OTP code to update your credentials:
    </p>

    <div style="text-align: center; margin: 28px 0;">
      {otp_boxes}
    </div>

    <p style="font-size: 12px; color: #64748B; font-weight: 500; text-align: center;">
      This security code is valid for 10 minutes. If you did not request this, please secure your account immediately.
    </p>

    <div class="footer">
      &copy; 2026 Aptora. Security Notification.
    </div>
  </div>
</body>
</html>"""

def generate_account_deletion_email_html(name: str, otp: str) -> str:
    otp_boxes = "".join([
      f'<div style="display: inline-block; width: 42px; height: 50px; line-height: 50px; text-align: center; background: #FEF2F2; border: 2px solid #E11D48; border-radius: 12px; font-size: 26px; font-weight: 900; color: #E11D48; margin: 0 4px;">{digit}</div>'
      for digit in otp
    ])

    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Account Deletion - Aptora</title>
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
      Hi {name}, we received a request to permanently delete your Aptora account and erase all associated syllabus data, study progress, and mock test scores.
    </p>

    <div style="text-align: center; margin: 24px 0;">
      {otp_boxes}
    </div>

    <div style="background: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 16px; padding: 14px 18px; font-size: 12px; color: #991B1B; font-weight: 600; line-height: 1.5; margin-bottom: 24px;">
      ⚠️ <strong>WARNING:</strong> Deletion is permanent and irreversible. If you did not request this, ignore this email.
    </div>

    <div class="footer">
      &copy; 2026 Aptora. Security System.
    </div>
  </div>
</body>
</html>"""

def generate_daily_briefing_email_html(name: str, target_exam: str, target_date: str, focus_subject: str, pending_tasks: int) -> str:
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Daily AI Study Briefing - Aptora</title>
  <style>{EMAIL_COMMON_STYLES}</style>
</head>
<body>
  <div class="email-container">
    {generate_logo_header_html()}

    <div style="text-align: center;">
      <div class="badge-pill">☀️ Daily AI Briefing</div>
    </div>

    <h1>Good Morning, {name}! 🎯</h1>

    <p class="body-text">
      Here is your AI-curated study plan for <strong>{target_exam}</strong> targeting your exam date on <strong>{target_date}</strong>.
    </p>

    <div style="background: #FAF9F6; border: 1px solid #E2E8F0; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
      <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #084C38; letter-spacing: 0.8px; margin-bottom: 8px;">🔥 Today's Priority Focus</div>
      <div style="font-size: 16px; font-weight: 800; color: #0F172A; margin-bottom: 4px;">{focus_subject}</div>
      <div style="font-size: 13px; font-weight: 600; color: #64748B;">{pending_tasks} focus modules scheduled for today</div>
    </div>

    <div style="text-align: center;">
      <a href="http://localhost:3000/dashboard?tab=planner" style="display: inline-block; background: #084C38; color: #FFFFFF; font-weight: 800; font-size: 13px; text-decoration: none; padding: 12px 28px; border-radius: 14px; box-shadow: 0 4px 12px rgba(8,76,56,0.25);">
        Open Daily Planner &rarr;
      </a>
    </div>

    <div class="footer">
      &copy; 2026 Aptora. Smart educational platform.
    </div>
  </div>
</body>
</html>"""

def generate_weekly_digest_email_html(name: str, target_exam: str, streak: int, syllabus_pct: int, study_hours: float) -> str:
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Weekly Progress Digest - Aptora</title>
  <style>{EMAIL_COMMON_STYLES}</style>
</head>
<body>
  <div class="email-container">
    {generate_logo_header_html()}

    <div style="text-align: center;">
      <div class="badge-pill">📈 Weekly Digest</div>
    </div>

    <h1>Weekly Performance Report</h1>

    <p class="body-text">
      Great work this week, {name}! Here is your automated progress summary for <strong>{target_exam}</strong>:
    </p>

    <div style="display: table; width: 100%; margin-bottom: 24px;">
      <div style="display: table-cell; width: 33%; text-align: center; padding: 12px; background: #FAF9F6; border: 1px solid #E2E8F0; border-radius: 16px;">
        <div style="font-size: 20px; font-weight: 900; color: #084C38;">{streak} Days</div>
        <div style="font-size: 10px; font-weight: 800; color: #64748B; text-transform: uppercase;">Study Streak</div>
      </div>
      <div style="display: table-cell; width: 33%; text-align: center; padding: 12px; background: #FAF9F6; border: 1px solid #E2E8F0; border-radius: 16px;">
        <div style="font-size: 20px; font-weight: 900; color: #059669;">{syllabus_pct}%</div>
        <div style="font-size: 10px; font-weight: 800; color: #64748B; text-transform: uppercase;">Syllabus Done</div>
      </div>
      <div style="display: table-cell; width: 33%; text-align: center; padding: 12px; background: #FAF9F6; border: 1px solid #E2E8F0; border-radius: 16px;">
        <div style="font-size: 20px; font-weight: 900; color: #D97706;">{study_hours}h</div>
        <div style="font-size: 10px; font-weight: 800; color: #64748B; text-transform: uppercase;">Total Time</div>
      </div>
    </div>

    <div style="text-align: center;">
      <a href="http://localhost:3000/dashboard/analytics" style="display: inline-block; background: #084C38; color: #FFFFFF; font-weight: 800; font-size: 13px; text-decoration: none; padding: 12px 28px; border-radius: 14px;">
        View Performance Analytics &rarr;
      </a>
    </div>

    <div class="footer">
      &copy; 2026 Aptora. Progress Digest.
    </div>
  </div>
</body>
</html>"""

def generate_milestone_unlocked_email_html(name: str, badge_title: str, xp_earned: int, total_xp: int) -> str:
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Milestone Unlocked! - Aptora</title>
  <style>{EMAIL_COMMON_STYLES}</style>
</head>
<body>
  <div class="email-container">
    {generate_logo_header_html()}

    <div style="text-align: center;">
      <div class="badge-pill" style="background: #FFFBEB; border-color: #FDE68A; color: #D97706;">🏆 Badge Unlocked</div>
    </div>

    <h1>Congratulations, {name}! 🎖️</h1>

    <p class="body-text">
      You've unlocked a new syllabus milestone on Aptora:
    </p>

    <div style="text-align: center; background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 20px; padding: 24px; margin-bottom: 24px;">
      <div style="font-size: 36px; margin-bottom: 8px;">🏆</div>
      <div style="font-size: 18px; font-weight: 900; color: #92400E; margin-bottom: 4px;">{badge_title}</div>
      <div style="font-size: 12px; font-weight: 800; color: #D97706; text-transform: uppercase;">+{xp_earned} XP EARNED • Total {total_xp} XP</div>
    </div>

    <div style="text-align: center;">
      <a href="http://localhost:3000/dashboard/achievements" style="display: inline-block; background: #084C38; color: #FFFFFF; font-weight: 800; font-size: 13px; text-decoration: none; padding: 12px 28px; border-radius: 14px;">
        View Trophy Cabinet &rarr;
      </a>
    </div>

    <div class="footer">
      &copy; 2026 Aptora. Achievement Notification.
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

