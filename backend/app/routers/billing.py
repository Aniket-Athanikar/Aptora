import logging
import datetime
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import UserDb, UserProfileDb, OrderDb
from app.schemas import InvoiceEmailPayload, OrderUpdatePayload
from app.utils.email import send_real_email

logger = logging.getLogger("backend")
router = APIRouter(prefix="/api/billing", tags=["billing"])

@router.post("/send-invoice")
async def send_invoice(payload: InvoiceEmailPayload, db: Session = Depends(get_db)):
    date_str = datetime.datetime.now().strftime("%d %b %Y, %I:%M %p")
    
    # Record transaction to orders database
    user = db.query(UserDb).filter(UserDb.email == payload.email).first()
    if user:
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

    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ExamForge AI - Subscription Invoice</title>
  <style>
    body {{
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background-color: #F9FAFB;
      margin: 0;
      padding: 40px 20px;
      color: #374151;
    }}
    .container {{
      max-width: 560px;
      margin: 0 auto;
      background: #FFFFFF;
      border: 1.5px solid #E5E7EB;
      border-radius: 24px;
      padding: 40px 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
    }}
    .header {{
      border-bottom: 1.5px solid #F3F4F6;
      padding-bottom: 25px;
      margin-bottom: 25px;
      text-align: center;
    }}
    .logo {{
      font-size: 26px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #111827;
      text-decoration: none;
    }}
    .logo-ai {{
      color: #6D4AFF;
    }}
    .invoice-title {{
      font-size: 16px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #059669;
      margin-top: 12px;
    }}
    .section-title {{
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: #9CA3AF;
      letter-spacing: 1.5px;
      margin-bottom: 10px;
    }}
    .info-grid {{
      display: table;
      width: 100%;
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 30px;
    }}
    .info-row {{
      display: table-row;
    }}
    .info-col {{
      display: table-cell;
      padding: 8px 10px;
      font-size: 13px;
    }}
    .info-label {{
      color: #6B7280;
      font-weight: 600;
      margin-bottom: 2px;
    }}
    .info-val {{
      color: #111827;
      font-weight: 800;
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
      color: #9CA3AF;
      text-transform: uppercase;
      border-bottom: 1.5px solid #E5E7EB;
    }}
    .invoice-table td {{
      padding: 15px 10px;
      font-size: 13.5px;
      font-weight: 700;
      color: #374151;
      border-bottom: 1px solid #F3F4F6;
    }}
    .total-row {{
      font-size: 15px;
      font-weight: 900;
      color: #6D4AFF;
    }}
    .footer {{
      font-size: 11.5px;
      color: #9CA3AF;
      text-align: center;
      margin-top: 40px;
      border-top: 1.5px solid #F3F4F6;
      padding-top: 25px;
      font-weight: 600;
      line-height: 1.6;
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="logo">EXAM FORGE<span class="logo-ai"> AI</span></span>
      <div class="invoice-title">Invoice Approved</div>
    </div>
    
    <div class="section-title">Account Details</div>
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 16px; padding: 20px; margin-bottom: 30px; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 10px; font-size: 13px; width: 50%; vertical-align: top; border: none;">
          <div class="info-label">Customer Email</div>
          <div class="info-val">{payload.email}</div>
        </td>
        <td style="padding: 8px 10px; font-size: 13px; width: 50%; vertical-align: top; border: none;">
          <div class="info-label">Billing Date</div>
          <div class="info-val">{date_str}</div>
        </td>
      </tr>
      <tr>
        <td style="padding: 16px 10px 8px 10px; font-size: 13px; width: 50%; vertical-align: top; border: none;">
          <div class="info-label">Transaction ID</div>
          <div class="info-val" style="font-family: monospace;">{payload.txnId}</div>
        </td>
        <td style="padding: 16px 10px 8px 10px; font-size: 13px; width: 50%; vertical-align: top; border: none;">
          <div class="info-label">Secure Gateway</div>
          <div class="info-val">ExamForge SecurePay</div>
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
            ExamForge {payload.planName.capitalize()} Subscription
            <div style="font-size: 11px; color: #9CA3AF; font-weight: 500; margin-top: 4px;">
              Full features unlocked for selected billing cycle ({payload.cycle})
            </div>
          </td>
          <td style="text-align: right; font-weight: 800; color: #111827;">₹{base_val}</td>
        </tr>
        <tr>
          <td style="color: #6B7280; font-weight: 600;">GST (18% Integrated Rate)</td>
          <td style="text-align: right; color: #6B7280; font-weight: 600;">₹{gst_val}</td>
        </tr>
        <tr class="total-row">
          <td style="border-top: 1.5px solid #6D4AFF; padding-top: 15px;">Total Amount Paid</td>
          <td style="text-align: right; border-top: 1.5px solid #6D4AFF; padding-top: 15px; font-size: 18px;">₹{total_val}</td>
        </tr>
      </tbody>
    </table>

    <div class="footer">
      Thank you for your business! Your support powers the intelligence of the ExamForge ecosystem. 
      If you did not make this purchase, please contact our support desk immediately at agentforge29@gmail.com.
      <br><br>
      &copy; 2026 ExamForge AI. All rights reserved.
    </div>
  </div>
</body>
</html>
"""
    # Write to local template log for developer checking
    try:
        with open("last_email.html", "w", encoding="utf-8") as f:
            f.write(html_content)
        logger.info("Invoice email successfully generated and written to backend/last_email.html")
    except Exception as e:
        logger.warning(f"Could not write last_email.html file locally: {e}")

    # Transmit via real SMTP if enabled
    send_real_email(payload.email, f"Invoice {payload.txnId} - ExamForge AI", html_content)
    
    return {"success": True, "message": "Invoice successfully generated and sent to email."}

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
