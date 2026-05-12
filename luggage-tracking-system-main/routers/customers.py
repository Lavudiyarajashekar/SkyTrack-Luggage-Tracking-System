from fastapi import APIRouter, HTTPException, Path, status
from pydantic import BaseModel, Field
from typing import Optional
from models import Customer, Ticket, Luggage, LuggageTracking, Airport
from utils import db_dependency, compute_luggage_status
from routers.auth import user_dependency, bcrypt_context

router = APIRouter(
    prefix="/customers",
    tags=["Customers"]
)

class UserVerificationRequest(BaseModel):  
    password: str
    new_password: str = Field(min_length=6)

class TicketRequest(BaseModel):
    origin: str = Field(min_length=3, max_length=10)
    destination: str = Field(min_length=3, max_length=10)
    class_type: str = Field(max_length=50)
    meal_included: Optional[str] = Field(None, max_length=10)


###################customer routes##################

#get customer info
@router.get("/",status_code=status.HTTP_200_OK)
async def get_customer_info(user: user_dependency, db: db_dependency):
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication failed")
    return db.query(Customer).filter(Customer.id == user.get("id")).first()


#change password
@router.put("/password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(db:db_dependency, user:user_dependency, user_verification:UserVerificationRequest): # type: ignore
    if user is None:
        raise HTTPException(status_code=401, detail='Authentication failed')
    customer_model = db.query(Customer).filter(Customer.id == user.get('id')).first()
    if customer_model is None:
        raise HTTPException(status_code=404, detail='user not found')
    if not bcrypt_context.verify(user_verification.password, customer_model.hashed_password):
        raise HTTPException(status_code=401, detail='Error on password change')
    customer_model.hashed_password = bcrypt_context.hash(user_verification.new_password)

    db.add(customer_model)
    db.commit()

##################ticket routes##################

#get all tickets(by customer)
@router.get("/tickets", status_code=status.HTTP_200_OK)
async def get_all_tickets(user: user_dependency, db: db_dependency):
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication failed")
    return db.query(Ticket).filter(Ticket.customer_id == user.get('id')).all()

#create a new ticket
@router.post("/tickets", status_code=status.HTTP_201_CREATED)
async def create_ticket(user: user_dependency, db: db_dependency, ticket_req: TicketRequest):
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication failed")
    origin = db.query(Airport).filter(Airport.airport_code == ticket_req.origin.upper()).first()
    dest = db.query(Airport).filter(Airport.airport_code == ticket_req.destination.upper()).first()
    if not origin or not dest:
        raise HTTPException(status_code=404, detail="Airport not found")

    ticket_model = Ticket(
        origin=origin.airport_code,
        destination=dest.airport_code,
        class_type=ticket_req.class_type,
        meal_included=ticket_req.meal_included,
        customer_id=user.get('id')
    )
    db.add(ticket_model)
    db.commit()

#get a ticket by id
@router.get("/tickets/{ticket_id}", status_code=status.HTTP_200_OK)
async def get_ticket(user: user_dependency, db: db_dependency, ticket_id: int = Path(gt=0)):
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication failed")
    ticket_model = db.query(Ticket).filter(Ticket.ticket_number == ticket_id).filter(Ticket.customer_id == user.get('id')).first()
    if not ticket_model:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket_model

#update a ticket
@router.put("/tickets/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
async def update_ticket(user: user_dependency, db: db_dependency, ticket_req: TicketRequest, ticket_id: int = Path(gt=0)):
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication failed")
    ticket_model = db.query(Ticket).filter(Ticket.ticket_number == ticket_id).filter(Ticket.customer_id == user.get('id')).first()
    if not ticket_model:
        raise HTTPException(status_code=404, detail="Ticket not found")
    origin = db.query(Airport).filter(Airport.airport_code == ticket_req.origin.upper()).first()
    dest = db.query(Airport).filter(Airport.airport_code == ticket_req.destination.upper()).first()
    if not origin or not dest:
        raise HTTPException(status_code=404, detail="Airport not found")
    ticket_model.origin = origin.airport_code
    ticket_model.destination = dest.airport_code
    ticket_model.class_type = ticket_req.class_type
    ticket_model.meal_included = ticket_req.meal_included
    db.add(ticket_model)
    db.commit()


################### luggage routes ####################

#get all luggage
@router.get("/luggage", status_code=status.HTTP_200_OK)
async def get_all_luggage(user: user_dependency, db: db_dependency):
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication failed")
    return db.query(Luggage).join(Ticket, Luggage.ticket_id == Ticket.ticket_number).filter(Ticket.customer_id == user.get("id")).all()

#get a luggage by id
@router.get("/luggage/{luggage_id}", status_code=status.HTTP_200_OK)
async def get_luggage(user: user_dependency, db: db_dependency, luggage_id: int = Path(gt=0)):
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication failed")
    luggage_model = db.query(Luggage).join(Ticket, Luggage.ticket_id == Ticket.ticket_number).filter(Ticket.customer_id == user.get("id")).filter(Luggage.id == luggage_id).first()
    if not luggage_model:
        raise HTTPException(status_code=404, detail="Luggage not found")
    return luggage_model

###################luggage tracking route####################

#get all luggage tracking
@router.get("/luggage-tracking", status_code=status.HTTP_200_OK)
async def get_all_luggage_tracking(user: user_dependency, db: db_dependency):
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication failed")
    
    return (db.query(LuggageTracking).join(Luggage, LuggageTracking.luggage_id == Luggage.id).
    join(Ticket, Luggage.ticket_id == Ticket.ticket_number).
    filter(Ticket.customer_id == user.get("id")).all()
    )

#get luggage status by ticket number
@router.get("/luggage-tracking/status/{ticket_id}", status_code=status.HTTP_200_OK)
async def get_luggage_status_by_ticket(user: user_dependency, db: db_dependency, ticket_id: int = Path(gt=0)):
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication failed")
    ticket_model = None
    if user.get("role") == "admin":
        ticket_model = db.query(Ticket).filter(Ticket.ticket_number == ticket_id).first()
    else:
        ticket_model = db.query(Ticket).filter(Ticket.ticket_number == ticket_id).filter(Ticket.customer_id == user.get("id")).first()
    if not ticket_model:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    luggages = db.query(Luggage).join(Ticket, Luggage.ticket_id == Ticket.ticket_number).filter(Luggage.ticket_id == ticket_id).all()
    
    luggage_details = []
    any_updates = False
    
    for lug in luggages:
        tracking = db.query(LuggageTracking).filter(LuggageTracking.luggage_id == lug.id).first() 
        if tracking:
            computed = compute_luggage_status(db, tracking)
            if tracking.status != computed:
                tracking.status = computed
                db.add(tracking)
                any_updates = True
            
            luggage_details.append({
                "luggage_id": lug.id,
                "weight": lug.weight,
                "size": lug.size,
                "status": tracking.status,
                "last_location": tracking.last_location,
                "next_destination": tracking.next_destination,
                "scan_datetime": tracking.scan_datetime.isoformat() if tracking.scan_datetime else None
            })
        else:
            luggage_details.append({
                "luggage_id": lug.id,
                "weight": lug.weight,
                "size": lug.size,
                "status": "PENDING",
                "last_location":ticket_model.origin ,
                "next_destination": ticket_model.destination,
                "scan_datetime": None
            })
    
    if any_updates:
        db.commit()
    
    return {
        "ticket_id": ticket_id,
        "origin": ticket_model.origin,
        "destination": ticket_model.destination,
        "luggage_count": len(luggage_details),
        "luggages": luggage_details
    }

#get luggage events for customer
@router.get("/luggage/{luggage_id}/events", status_code=status.HTTP_200_OK)
async def get_customer_luggage_events(user: user_dependency, db: db_dependency, luggage_id: int = Path(gt=0)):
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication failed")
    
    # Verify the customer owns this luggage
    luggage_model = db.query(Luggage).join(Ticket, Luggage.ticket_id == Ticket.ticket_number).filter(Ticket.customer_id == user.get("id")).filter(Luggage.id == luggage_id).first()
    if not luggage_model:
        raise HTTPException(status_code=404, detail="Luggage not found or not authorized")
        
    from models import LuggageEvent
    return (
      db.query(LuggageEvent)
      .filter(LuggageEvent.luggage_id == luggage_id)
      .order_by(LuggageEvent.timestamp)
      .all()
    )