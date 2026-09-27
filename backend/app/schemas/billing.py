"""
Aptora — Billing Schemas
"""
from typing import Optional
from pydantic import BaseModel


class InvoiceEmailPayload(BaseModel):
    email: str
    planName: str
    cycle: str
    amount: str
    txnId: str


class OrderUpdatePayload(BaseModel):
    plan_name: Optional[str] = None
    cycle: Optional[str] = None
    amount: Optional[str] = None
    txn_id: Optional[str] = None
