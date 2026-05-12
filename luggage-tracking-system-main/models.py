from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from database import Base
from sqlalchemy import Text
from datetime import datetime

class Customer(Base):
    __tablename__ = "customer"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, nullable=False, unique=True)
    address = Column(String)
    mobile_number = Column(String)
    role = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    hashed_password = Column(String, nullable=False)


class Airport(Base):
    __tablename__ = "airport"

    airport_code = Column(String(10), primary_key=True, index=True)
    city = Column(String(255))
    state = Column(String(255))
    country = Column(String(255))

class Ticket(Base):
    __tablename__ = "ticket"

    ticket_number = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customer.id"))
    origin = Column(String(10), ForeignKey("airport.airport_code"))
    destination = Column(String(10), ForeignKey("airport.airport_code"))
    class_type = Column(String(50)) 
    meal_included = Column(String(10))

# class Luggage(Base):
#     __tablename__ = "luggage"

#     id = Column(Integer, primary_key=True, index=True)
#     ticket_id = Column(Integer, ForeignKey("ticket.ticket_number"))
#     weight = Column(Integer)
#     size = Column(String(50))
   


class LuggageTracking(Base):
    __tablename__ = "luggage_tracking"

    luggage_id = Column(Integer, ForeignKey("luggage.id"), primary_key=True)
    last_location = Column(String(10), ForeignKey("airport.airport_code"))
    scan_datetime = Column(DateTime)
    next_destination = Column(String(10), ForeignKey("airport.airport_code"))
    assigned = Column(Boolean, nullable=False, default=False)
    status = Column(String(20), nullable=False, default="NEW")

class Luggage(Base):
    __tablename__ = "luggage"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("ticket.ticket_number"))
    weight = Column(Integer)
    size = Column(String(50))

    tracking = relationship(
      "LuggageTracking",
      uselist=False,
      backref="luggage",
      cascade="all, delete"
    )

    events = relationship(
      "LuggageEvent",
      back_populates="luggage",
      cascade="all, delete-orphan",
      order_by="LuggageEvent.timestamp"
    )


class LuggageEvent(Base):
    __tablename__ = "luggage_events"

    id = Column(Integer, primary_key=True,index=True)
    luggage_id = Column(
      Integer,
      ForeignKey("luggage.id"),
      nullable=False
    )

    event_type = Column(String(50),nullable=False)
    location = Column(String(10),nullable=False)
    timestamp = Column(
      DateTime,
      default=datetime.utcnow
    )
    notes = Column(Text)

    luggage = relationship(
      "Luggage",
      back_populates="events"
    )
