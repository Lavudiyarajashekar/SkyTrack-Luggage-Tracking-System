from database import SessionLocal  # pyright: ignore[reportMissingImports]
from typing import Annotated
from sqlalchemy.orm import Session
from fastapi import Depends
from models import Luggage, LuggageTracking, Ticket

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session,Depends(get_db)]


VALID_STATUSES = ["NEW", "ASSIGNED", "VERIFIED", "FAILED", "APPROVED", "REJECTED"]
LUGGAGE_EVENTS=[
"CHECKED_IN",
"SECURITY_SCAN",
"LOADED_ON_FLIGHT",
"TRANSFERRED",
"ARRIVED",
"DELIVERED"
]

LUGGAGE_EVENTS=[
 "CHECKED_IN",
 "SECURITY_SCAN",
 "LOADED_ON_FLIGHT",
 "TRANSFERRED",
 "ARRIVED",
 "DELIVERED"
]

def compute_luggage_status(db, tracking: LuggageTracking):
    luggage = db.query(Luggage).filter(Luggage.id == tracking.luggage_id).first()
    if not luggage:
        return tracking.status or "NEW"

    ticket_model = db.query(Ticket).filter(Ticket.ticket_number == luggage.ticket_id).first()
    if not ticket_model:
        return tracking.status or "NEW"

    current_status = tracking.status or "NEW"
    destination = ticket_model.destination.upper()
    last_location = tracking.last_location.upper() if tracking.last_location else None

    if current_status in ["APPROVED", "REJECTED", "FAILED"]:
        return current_status
    if current_status == "NEW" and getattr(tracking, "assigned", False):
        return "ASSIGNED"
    if current_status == "ASSIGNED" and getattr(tracking, "scan_datetime", None):
        return "VERIFIED"
    if current_status == "VERIFIED" and last_location == destination:
        return "APPROVED"

    return current_status



