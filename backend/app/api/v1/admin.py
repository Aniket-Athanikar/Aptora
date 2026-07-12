from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.models.contact import ContactDb
from app.models.newsletter import NewsletterDb

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/contacts")
async def get_contacts(db: Session = Depends(get_db)):
    contacts = db.query(ContactDb).order_by(ContactDb.created_at.desc()).all()
    return {"success": True, "contacts": [
        {"id": c.id, "name": c.name, "email": c.email, "subject": c.subject, "message": c.message, "created_at": c.created_at.isoformat()}
        for c in contacts
    ]}

@router.delete("/contacts/{id}")
async def delete_contact(id: int, db: Session = Depends(get_db)):
    contact = db.query(ContactDb).filter(ContactDb.id == id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Entry not found.")
    db.delete(contact)
    db.commit()
    return {"success": True, "message": "Contact entry successfully deleted."}

@router.get("/newsletter")
async def get_newsletter_subscribers(db: Session = Depends(get_db)):
    subscribers = db.query(NewsletterDb).order_by(NewsletterDb.created_at.desc()).all()
    return {"success": True, "subscribers": [
        {"id": s.id, "email": s.email, "created_at": s.created_at.isoformat()}
        for s in subscribers
    ]}

@router.delete("/newsletter/{id}")
async def delete_subscriber(id: int, db: Session = Depends(get_db)):
    sub = db.query(NewsletterDb).filter(NewsletterDb.id == id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscriber not found.")
    db.delete(sub)
    db.commit()
    return {"success": True, "message": "Subscriber entry successfully deleted."}
