from fastapi import APIRouter, HTTPException, Path, status 
from typing import Optional # type: ignore
from routers.auth import user_dependency
from utils import db_dependency, compute_luggage_status, VALID_STATUSES
from models import Customer, Ticket, Luggage, LuggageTracking , LuggageEvent# type: ignore
from pydantic import BaseModel, Field
from datetime import datetime
from utils import LUGGAGE_EVENTS

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


class LuggageCreateRequest(BaseModel):
    ticket_id: int = Field(gt=0)
    weight: int = Field(gt=0)
    size: str = Field(min_length=3, max_length=50)

class LuggageTrackingUpdateRequest(BaseModel):
    last_location: Optional[str] = Field(None, min_length=3, max_length=10)
    next_destination: Optional[str] = Field(None, min_length=3, max_length=10)
    scan_datetime: Optional[datetime] = None
    assigned: Optional[bool] = None
    status: Optional[str] = Field(None, min_length=3, max_length=20)

class LuggageTrackingCreateRequest(BaseModel):
    luggage_id: int = Field(gt=0)
    last_location: str = Field(min_length=3, max_length=10)
    scan_datetime: Optional[datetime] = None
    next_destination: Optional[str] = Field(None, min_length=3, max_length=10)
    assigned: Optional[bool] = False
    status: Optional[str] = Field(None, min_length=3, max_length=20)


class LuggageEventRequest(BaseModel):
    event_type: str
    location: str
    notes: str | None = None

#get all customers
@router.get("/customers", status_code=status.HTTP_200_OK)
async def get_all_customers(user: user_dependency, db: db_dependency):
    if user is None or user.get('role')!='admin':
        raise HTTPException(status_code=401, detail="Authentication failed")
    return db.query(Customer).all()

#delete a customer
@router.delete("/customers/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer(user: user_dependency, db: db_dependency, customer_id: int = Path(gt=0)):
    if user is None or user.get('role')!='admin':
        raise HTTPException(status_code=401, detail="Authentication failed")
    customer_model = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer_model:
        raise HTTPException(status_code=404, detail="Customer not found")
    tickets = db.query(Ticket).filter(Ticket.customer_id == customer_id).all()
    for ticket in tickets:
        luggage = db.query(Luggage).filter(Luggage.ticket_id == ticket.ticket_number).all()
        for lug in luggage:
            luggage_tracking = db.query(LuggageTracking).filter(LuggageTracking.luggage_id == lug.id).first()
            if luggage_tracking:
                db.delete(luggage_tracking)
                db.commit()
            db.delete(lug)
            db.commit()
        db.delete(ticket)
        db.commit()
    db.delete(customer_model)
    db.commit()

#get all tickets
@router.get("/tickets", status_code=status.HTTP_200_OK)
async def get_all_tickets(user: user_dependency, db: db_dependency):
    if user is None or user.get('role')!='admin':
        raise HTTPException(status_code=401, detail="Authentication failed")
    return db.query(Ticket).all()

#delete a ticket
@router.delete("/tickets/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ticket(user: user_dependency, db: db_dependency, ticket_id: int = Path(gt=0)):
    if user is None or user.get('role')!='admin':
        raise HTTPException(status_code=401, detail="Authentication failed")
    ticket_model = db.query(Ticket).filter(Ticket.ticket_number == ticket_id).first()
    if not ticket_model:
        raise HTTPException(status_code=404, detail="Ticket not found")
    luggage = db.query(Luggage).filter(Luggage.ticket_id == ticket_id).all()
    for lug in luggage:
        luggage_tracking = db.query(LuggageTracking).filter(LuggageTracking.luggage_id == lug.id).first()
        if luggage_tracking:
            db.delete(luggage_tracking)
            db.commit()
        db.delete(lug)
        db.commit()
    db.delete(ticket_model)
    db.commit()

#create luggage
@router.post("/luggage", status_code=status.HTTP_201_CREATED)
async def create_luggage(user: user_dependency, db: db_dependency, luggage_req: LuggageCreateRequest):
    if user is None or user.get('role')!='admin':
        raise HTTPException(status_code=401, detail="Authentication failed")
 
    ticket_model = db.query(Ticket).filter(Ticket.ticket_number == luggage_req.ticket_id).first()
    if not ticket_model:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    luggage_model = Luggage(**luggage_req.model_dump())
    db.add(luggage_model)
    db.commit()
    
    luggage_tracking_model = LuggageTracking(
        luggage_id=luggage_model.id,
        last_location=ticket_model.origin,
        scan_datetime=None,
        next_destination=ticket_model.destination,
        assigned=False,
        status="NEW"
    )
    db.add(luggage_tracking_model)
    db.commit()

    initial_event = LuggageEvent(
    luggage_id=luggage_model.id,
    event_type="CHECKED_IN",
    location=ticket_model.origin,
    notes="Passenger checked in baggage"
    )

    db.add(initial_event)
    db.commit()






#get all luggage
@router.get("/luggage", status_code=status.HTTP_200_OK)
async def get_all_luggage(user: user_dependency, db: db_dependency):
    if user is None or user.get('role')!='admin':
        raise HTTPException(status_code=401, detail="Authentication failed")
    return db.query(Luggage).all()

#delete a luggage
@router.delete("/luggage/{luggage_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_luggage(user: user_dependency, db: db_dependency, luggage_id: int = Path(gt=0)):
    if user is None or user.get('role')!='admin':
        raise HTTPException(status_code=401, detail="Authentication failed")
    luggage_model = db.query(Luggage).filter(Luggage.id == luggage_id).first()
    if not luggage_model:
        raise HTTPException(status_code=404, detail="Luggage not found")
    luggage_tracking_model = db.query(LuggageTracking).filter(LuggageTracking.luggage_id == luggage_id).first()
    if luggage_tracking_model:
        db.delete(luggage_tracking_model)
        db.flush()
    db.delete(luggage_model)
    db.commit()

#create a new luggage tracking
@router.post("/luggage-tracking",status_code=status.HTTP_201_CREATED)
async def create_luggage_tracking(user: user_dependency, db: db_dependency, luggage_tracking_req: LuggageTrackingCreateRequest):
    if user is None or user.get('role')!='admin':
        raise HTTPException(status_code=401, detail="Authentication failed")
    
    luggage_model = db.query(Luggage).filter(Luggage.id == luggage_tracking_req.luggage_id).first()
    if not luggage_model:
        raise HTTPException(status_code=404, detail="Luggage not found")
    
    existing = db.query(LuggageTracking).filter(LuggageTracking.luggage_id == luggage_tracking_req.luggage_id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Tracking already exists for this luggage")
    
    status_value = "NEW"
    if luggage_tracking_req.status:
        status_value = luggage_tracking_req.status.upper()
        if status_value not in VALID_STATUSES:
          raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(VALID_STATUSES)}")
    
    luggage_tracking_model = LuggageTracking(
        luggage_id=luggage_tracking_req.luggage_id,
        last_location=luggage_tracking_req.last_location.upper(),
        scan_datetime=luggage_tracking_req.scan_datetime,
        next_destination=luggage_tracking_req.next_destination.upper() if luggage_tracking_req.next_destination else None,
        assigned=bool(luggage_tracking_req.assigned),
        status=status_value
    )
    
    db.add(luggage_tracking_model)
    db.commit()
    

# get tickets without luggage (pending intake)
@router.get("/pending-tickets", status_code=status.HTTP_200_OK)
async def get_pending_tickets(user: user_dependency, db: db_dependency):
    if user is None or user.get('role')!='admin':
        raise HTTPException(status_code=401, detail="Authentication failed")
    
    # Get all tickets
    # Find tickets that do NOT have a corresponding Luggage entry
    pending_tickets = (
        db.query(Ticket)
        .outerjoin(Luggage, Ticket.ticket_number == Luggage.ticket_id)
        .filter(Luggage.id == None)
        .all()
    )
    
    result = []
    for t in pending_tickets:
        customer = db.query(Customer).filter(Customer.id == t.customer_id).first()
        result.append({
            "ticket_number": t.ticket_number,
            "origin": t.origin,
            "destination": t.destination,
            "customer_name": customer.username if customer else "Unknown"
        })
    return result

#get all luggage tracking
@router.get("/luggage-tracking", status_code=status.HTTP_200_OK)
async def get_all_luggage_tracking(user: user_dependency, db: db_dependency):
    if user is None or user.get('role')!='admin':
        raise HTTPException(status_code=401, detail="Authentication failed")
    return db.query(LuggageTracking).all()

#get one luggage tracking by luggage id
@router.get("/luggage-tracking/{luggage_id}",status_code=status.HTTP_200_OK)
async def get_luggage_tracking(user: user_dependency, db: db_dependency, luggage_id: int = Path(gt=0)):
    if user is None or user.get('role')!='admin':
        raise HTTPException(status_code=401, detail="Authentication failed")
    luggage_tracking_model = db.query(LuggageTracking).filter(LuggageTracking.luggage_id == luggage_id).first()
    if not luggage_tracking_model:
        raise HTTPException(status_code=404, detail="Luggage tracking not found")
    return luggage_tracking_model


#update luggage tracking
@router.put("/luggage-tracking/{luggage_id}", status_code=status.HTTP_200_OK)
async def update_luggage_tracking(user: user_dependency, db: db_dependency, update_req: LuggageTrackingUpdateRequest, luggage_id: int = Path(gt=0)):
    if user is None or user.get('role')!='admin':
        raise HTTPException(status_code=401, detail="Authentication failed")
    
    luggage_tracking_model = db.query(LuggageTracking).filter(LuggageTracking.luggage_id == luggage_id).first()
    if not luggage_tracking_model:
        raise HTTPException(status_code=404, detail="Luggage tracking not found")
    
    if update_req.last_location:
        luggage_tracking_model.last_location = update_req.last_location.upper()
    if update_req.next_destination:
        luggage_tracking_model.next_destination = update_req.next_destination.upper()
    

    if update_req.scan_datetime is not None:
        luggage_tracking_model.scan_datetime = update_req.scan_datetime

    if update_req.assigned is not None:
        luggage_tracking_model.assigned = update_req.assigned

    if update_req.status:
        if update_req.status.upper() not in VALID_STATUSES:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(VALID_STATUSES)}")
        luggage_tracking_model.status = update_req.status.upper()
    else:
        if update_req.last_location is not None or update_req.assigned is not None or update_req.scan_datetime is not None:
            luggage_tracking_model.status = compute_luggage_status(db, luggage_tracking_model)
    
    db.add(luggage_tracking_model)
    db.commit()

#delete a luggage tracking
@router.delete("/luggage-tracking/{luggage_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_luggage_tracking(user: user_dependency, db: db_dependency, luggage_id: int = Path(gt=0)):
    if user is None or user.get('role')!='admin':
        raise HTTPException(status_code=401, detail="Authentication failed")
    luggage_tracking_model = db.query(LuggageTracking).filter(LuggageTracking.luggage_id == luggage_id).first()
    if not luggage_tracking_model:
        raise HTTPException(status_code=404, detail="Luggage tracking not found")
    db.delete(luggage_tracking_model)
    db.commit()
    

# check if all luggage of a customer has reached destination
@router.get("/customer-luggage/{customer_id}", status_code=status.HTTP_200_OK)
async def customer_luggage_check(user: user_dependency, db: db_dependency, customer_id: int = Path(gt=0)):
    if user is None or user.get('role') != 'admin':
        raise HTTPException(status_code=401, detail="Authentication failed")

    luggage_models = (
        db.query(Luggage)
        .join(Ticket, Luggage.ticket_id == Ticket.ticket_number)
        .filter(Ticket.customer_id == customer_id)
        .all()
    )
    if not luggage_models:
        raise HTTPException(status_code=404, detail="No luggage found for this customer")

    all_reached = True
    for lug in luggage_models:
        tr = db.query(LuggageTracking).filter(LuggageTracking.luggage_id == lug.id).first()
        if not tr:
            all_reached = False
            break
        computed = compute_luggage_status(db, tr)
        if tr.status != computed:
            tr.status = computed
            db.add(tr)
            db.commit()
        if tr.status != "APPROVED":
            all_reached = False
            break

    return {"all_reached": all_reached}

# status filter across all luggage
@router.get("/status/{status_value}", status_code=status.HTTP_200_OK)
async def get_luggage_by_status(user: user_dependency, db: db_dependency, status_value: str = Path(min_length=3, max_length=10)):
    if user is None or user.get('role')!='admin':
        raise HTTPException(status_code=401, detail="Authentication failed")
    desired = status_value.upper()
    if desired not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(VALID_STATUSES)}")
    all_luggage_tracking = db.query(LuggageTracking).join(Luggage, LuggageTracking.luggage_id == Luggage.id).join(Ticket, Luggage.ticket_id == Ticket.ticket_number).all()
    
    for tr in all_luggage_tracking:
        computed = compute_luggage_status(db, tr)
        if tr.status != computed:
            tr.status = computed
            db.add(tr)
    db.commit()
    filtered = []
    for tr in all_luggage_tracking:
        if tr.status == desired:
            filtered.append(tr)
    return filtered

#get customer details by luggage id
@router.get("/customer-details/{luggage_id}",status_code=status.HTTP_200_OK)
async def get_customer_details_by_luggage(user: user_dependency, db: db_dependency, luggage_id: int = Path(gt=0)):
    if user is None or user.get('role')!='admin':
        raise HTTPException(status_code=401, detail="Authentication failed")

    customer_model = (db.query(Customer).join(Ticket,Customer.id == Ticket.customer_id).
    join(Luggage, Ticket.ticket_number == Luggage.ticket_id).
    filter(Luggage.id == luggage_id).first()
    )
    if not customer_model:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    customer_data = {
        "id": customer_model.id,
        "username": customer_model.username,
        "email": customer_model.email,
        "role": customer_model.role,
        "address": customer_model.address,
        "mobile_number": customer_model.mobile_number
    }

    return customer_data



@router.post("/luggage/{luggage_id}/events")
async def add_luggage_event(
    user:user_dependency,
    db:db_dependency,
    luggage_id:int,
    event:LuggageEventRequest
):

    if user is None or user.get("role")!="admin":
        raise HTTPException(
            status_code=401,
            detail="Authentication failed"
        )

    luggage = db.query(Luggage).filter(
        Luggage.id == luggage_id
    ).first()

    if not luggage:
        raise HTTPException(
            status_code=404,
            detail="Luggage not found"
        )

    if event.event_type.upper() not in LUGGAGE_EVENTS:
        raise HTTPException(
            status_code=400,
            detail="Invalid event type"
        )

    new_event = LuggageEvent(
        luggage_id=luggage_id,
        event_type=event.event_type.upper(),
        location=event.location.upper(),
        notes=event.notes
    )

    db.add(new_event)

    tracking=db.query(LuggageTracking).filter(
        LuggageTracking.luggage_id==luggage_id
    ).first()

    if tracking:
        tracking.last_location=event.location.upper()
        tracking.status=event.event_type.upper()

    db.commit()

    return {"message":"event added"}



@router.get("/luggage/{luggage_id}/events")
async def get_luggage_events(
 user:user_dependency,
 db:db_dependency,
 luggage_id:int
):
    if user.get("role")!="admin":
        raise HTTPException(401)

    return (
      db.query(LuggageEvent)
      .filter(
        LuggageEvent.luggage_id==luggage_id
      )
      .order_by(
        LuggageEvent.timestamp
      )
      .all()
    )


@router.get("/stats", status_code=status.HTTP_200_OK)
async def get_admin_stats(user: user_dependency, db: db_dependency):
    if user is None or user.get('role') != 'admin':
        raise HTTPException(status_code=401, detail="Authentication failed")
    
    total_luggage = db.query(LuggageTracking).count()
    arrived_luggage = db.query(LuggageTracking).filter(LuggageTracking.status == 'ARRIVED').count()
    delivered_luggage = db.query(LuggageTracking).filter(LuggageTracking.status == 'DELIVERED').count()
    in_transit = total_luggage - arrived_luggage - delivered_luggage
    
    return {
        "total": total_luggage,
        "arrived": arrived_luggage + delivered_luggage,
        "inTransit": in_transit
    }