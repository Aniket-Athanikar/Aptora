import os
import logging
import datetime
from fastapi import APIRouter, HTTPException, Depends, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import UserDb, UserProfileDb, OrderDb
from app.schemas import InvoiceEmailPayload, OrderUpdatePayload
from app.services.email_service import send_email_with_pdf_attachment, send_real_email
from app.services.pdf_service import generate_invoice_pdf

logger = logging.getLogger("backend")
router = APIRouter(prefix="/api/billing", tags=["billing"])

INVOICES_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads", "invoices")
os.makedirs(INVOICES_DIR, exist_ok=True)

@router.post("/send-invoice")
async def send_invoice(payload: InvoiceEmailPayload, db: Session = Depends(get_db)):
    date_str = datetime.datetime.now().strftime("%d %b %Y, %I:%M %p")
    user_name = "Valued Member"
    
    # Record transaction to orders database
    user = db.query(UserDb).filter(UserDb.email == payload.email).first()
    if user:
        if hasattr(user, "full_name") and user.full_name:
            user_name = user.full_name
        elif hasattr(user, "username") and user.username:
            user_name = user.username

        # Check if transaction already exists
        existing_order = db.query(OrderDb).filter(OrderDb.txn_id == payload.txnId).first()
        if not existing_order:
            db_order = OrderDb(
                user_id=user.id,
                plan_name=payload.planName,
                cycle=payload.cycle,
                amount=payload.amount,
                txn_id=payload.txnId
            )
            db.add(db_order)
            
            # Also update user profile plan state automatically
            profile = db.query(UserProfileDb).filter(UserProfileDb.user_id == user.id).first()
            if profile:
                profile.plan = payload.planName.capitalize()
                renewal_days = 365 if payload.cycle.lower() == "yearly" else 30
                renewal_date = (datetime.datetime.utcnow() + datetime.timedelta(days=renewal_days)).strftime("%d %b %Y")
                profile.plan_renewal = f"Renews {renewal_date}"
            
            db.commit()
            logger.info(f"Recorded transaction {payload.txnId} for user {payload.email} and updated profile plan.")
    
    # Calculate base price and GST details (18%)
    try:
        total_val = int(float(payload.amount))
        gst_val = round(total_val * 0.18 / 1.18)
        base_val = total_val - gst_val
    except Exception:
        total_val = 0
        gst_val = 0
        base_val = 0

    # 1. Generate Modern PDF Invoice Bytes
    try:
        pdf_bytes = generate_invoice_pdf(
            email=payload.email,
            plan_name=payload.planName,
            cycle=payload.cycle,
            amount=payload.amount,
            txn_id=payload.txnId,
            user_name=user_name
        )
        invoice_filename = f"Aptora_Invoice_{payload.txnId}.pdf"
        local_filepath = os.path.join(INVOICES_DIR, invoice_filename)
        with open(local_filepath, "wb") as f:
            f.write(pdf_bytes)
    except Exception as e:
        logger.error(f"Failed generating PDF invoice: {e}")
        pdf_bytes = b""

    # 2. HTML Body
    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Aptora - Subscription Invoice</title>
  <style>
    body {{
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background-color: #FAF9F6;
      margin: 0;
      padding: 40px 20px;
      color: #0F172A;
    }}
    .container {{
      max-width: 560px;
      margin: 0 auto;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 24px;
      padding: 40px 30px;
      box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.04);
    }}
    .header {{
      border-bottom: 1px solid #F1F5F9;
      padding-bottom: 25px;
      margin-bottom: 25px;
      text-align: center;
    }}
    .header-logo {{
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 16px;
    }}
    .logo-text {{
      font-size: 26px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #0F172A;
    }}
    .invoice-title {{
      font-size: 14px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #084C38;
      background: #ECFDF5;
      border: 1px solid #D1FAE5;
      display: inline-block;
      padding: 4px 16px;
      border-radius: 9999px;
    }}
    .section-title {{
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: #64748B;
      letter-spacing: 1.5px;
      margin-bottom: 10px;
    }}
    .invoice-table {{
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      margin-bottom: 25px;
    }}
    .invoice-table th {{
      text-align: left;
      padding: 10px;
      font-size: 10px;
      font-weight: 800;
      color: #64748B;
      text-transform: uppercase;
      border-bottom: 1px solid #E2E8F0;
    }}
    .invoice-table td {{
      padding: 15px 10px;
      font-size: 13.5px;
      font-weight: 700;
      color: #334155;
      border-bottom: 1px solid #F1F5F9;
    }}
    .total-row {{
      font-size: 15px;
      font-weight: 900;
      color: #084C38;
    }}
    .footer {{
      font-size: 11.5px;
      color: #94A3B8;
      text-align: center;
      margin-top: 40px;
      border-top: 1px solid #F1F5F9;
      padding-top: 25px;
      font-weight: 600;
      line-height: 1.6;
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-logo">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle;">
          <path d="M16 3L4 27H11.5L16 17.5L20.5 27H28L16 3Z" fill="#084c38" />
          <path d="M16 11L12.5 19H19.5L16 11Z" fill="#ffffff" />
        </svg>
        <span class="logo-text">Aptora</span>
      </div>
      <div class="invoice-title">Order Confirmed & Invoice Attached 📎</div>
    </div>
    
    <div class="section-title">Account Details</div>
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #FAF9F6; border: 1px solid #E2E8F0; border-radius: 16px; padding: 20px; margin-bottom: 30px; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 10px; font-size: 13px; width: 50%; vertical-align: top; border: none;">
          <div style="color: #64748B; font-weight: 600; margin-bottom: 2px;">Customer Name</div>
          <div style="color: #0F172A; font-weight: 800;">{user_name}</div>
        </td>
        <td style="padding: 8px 10px; font-size: 13px; width: 50%; vertical-align: top; border: none;">
          <div style="color: #64748B; font-weight: 600; margin-bottom: 2px;">Customer Email</div>
          <div style="color: #0F172A; font-weight: 800;">{payload.email}</div>
        </td>
      </tr>
      <tr>
        <td style="padding: 16px 10px 8px 10px; font-size: 13px; width: 50%; vertical-align: top; border: none;">
          <div style="color: #64748B; font-weight: 600; margin-bottom: 2px;">Transaction ID</div>
          <div style="color: #0F172A; font-weight: 800; font-family: monospace;">{payload.txnId}</div>
        </td>
        <td style="padding: 16px 10px 8px 10px; font-size: 13px; width: 50%; vertical-align: top; border: none;">
          <div style="color: #64748B; font-weight: 600; margin-bottom: 2px;">Billing Date</div>
          <div style="color: #0F172A; font-weight: 800;">{date_str}</div>
        </td>
      </tr>
    </table>

    <table class="invoice-table">
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: right; width: 100px;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            Aptora {payload.planName.capitalize()} Subscription
            <div style="font-size: 11px; color: #64748B; font-weight: 500; margin-top: 4px;">
              Full features unlocked for selected billing cycle ({payload.cycle})
            </div>
          </td>
          <td style="text-align: right; font-weight: 800; color: #0F172A;">₹{base_val}</td>
        </tr>
        <tr>
          <td style="color: #64748B; font-weight: 600;">GST (18% Integrated Rate)</td>
          <td style="text-align: right; color: #64748B; font-weight: 600;">₹{gst_val}</td>
        </tr>
        <tr class="total-row">
          <td style="border-top: 2px solid #084C38; padding-top: 15px; color: #084C38;">Total Amount Paid</td>
          <td style="text-align: right; border-top: 2px solid #084C38; padding-top: 15px; font-size: 18px; color: #084C38;">₹{total_val}</td>
        </tr>
      </tbody>
    </table>

    <div style="background: #ECFDF5; border: 1px solid #D1FAE5; border-radius: 16px; padding: 16px; font-size: 12.5px; color: #084C38; font-weight: 700; text-align: center; margin-bottom: 20px;">
      📎 Your official PDF Tax Invoice has been generated and attached to this email.
    </div>

    <div class="footer">
      Thank you for your business! Your support powers the intelligence of the Aptora ecosystem. 
      If you did not make this purchase, please contact our support desk immediately at agentforge29@gmail.com.
      <br><br>
      &copy; 2026 Aptora. All rights reserved.
    </div>
  </div>
</body>
</html>
"""

    # 3. Transmit via SMTP with PDF attachment
    sent_via_smtp = False
    if pdf_bytes:
        sent_via_smtp = send_email_with_pdf_attachment(
            recipient_email=payload.email,
            subject=f"Tax Invoice {payload.txnId} - Aptora",
            html_content=html_content,
            pdf_bytes=pdf_bytes,
            filename=f"Aptora_Invoice_{payload.txnId}.pdf"
        )
    else:
        sent_via_smtp = send_real_email(payload.email, f"Invoice {payload.txnId} - Aptora", html_content)
    
    return {
        "success": True,
        "message": "Invoice PDF successfully generated and dispatched via email.",
        "sent_via_smtp": sent_via_smtp,
        "txn_id": payload.txnId
    }

@router.get("/download-invoice-pdf")
async def download_invoice_pdf(
    email: str,
    plan: str = "premium",
    cycle: str = "yearly",
    amount: str = "707",
    txnId: str = "EF-TXN-000000"
):
    try:
        pdf_bytes = generate_invoice_pdf(
            email=email,
            plan_name=plan,
            cycle=cycle,
            amount=amount,
            txn_id=txnId,
            user_name="Aptora Member"
        )
        filename = f"Aptora_Invoice_{txnId}.pdf"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as e:
        logger.error(f"Error serving PDF download: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate invoice PDF")

@router.get("/history")
async def get_billing_history(email: str, db: Session = Depends(get_db)):
    user = db.query(UserDb).filter(UserDb.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    orders = db.query(OrderDb).filter(OrderDb.user_id == user.id).order_by(OrderDb.created_at.desc()).all()
    
    history_list = []
    for order in orders:
        history_list.append({
            "id": order.id,
            "plan_name": order.plan_name,
            "cycle": order.cycle,
            "amount": order.amount,
            "txn_id": order.txn_id,
            "created_at": order.created_at.isoformat() if order.created_at else ""
        })
        
    return {"success": True, "history": history_list}

@router.put("/orders/{id}")
async def update_billing_order(id: int, payload: OrderUpdatePayload, db: Session = Depends(get_db)):
    order = db.query(OrderDb).filter(OrderDb.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
    
    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(order, key, value)
        
    db.commit()
    db.refresh(order)
    return {"success": True, "message": "Order updated successfully.", "order": {
        "id": order.id,
        "plan_name": order.plan_name,
        "cycle": order.cycle,
        "amount": order.amount,
        "txn_id": order.txn_id,
        "created_at": order.created_at.isoformat() if order.created_at else ""
    }}

@router.delete("/orders/{id}")
async def delete_billing_order(id: int, db: Session = Depends(get_db)):
    order = db.query(OrderDb).filter(OrderDb.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
    
    db.delete(order)
    db.commit()
    return {"success": True, "message": "Order deleted successfully."}
