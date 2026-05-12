from fastapi.testclient import TestClient # type: ignore
from sqlalchemy import create_engine, text # type: ignore
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker
from database import Base
from main import app
import pytest # type: ignore
from models import Customer, Ticket, Luggage, LuggageTracking, Airport
from routers.auth import bcrypt_context
from datetime import datetime


SQLALCHEMY_DATABASE_URL =  'sqlite:///./testdb.db'

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def load_airports(db):
    airports_data = [
        ("DEL", "New Delhi", "Delhi", "India"),
        ("BOM", "Mumbai", "Maharashtra", "India"),
        ("BLR", "Bangalore", "Karnataka", "India"),
        ("CCU", "Kolkata", "West Bengal", "India"),
        ("MAA", "Chennai", "Tamil Nadu", "India"),
        ("HYD", "Hyderabad", "Telangana", "India"),
        ("AMD", "Ahmedabad", "Gujarat", "India"),
        ("PNQ", "Pune", "Maharashtra", "India"),
        ("GOI", "Goa", "Goa", "India"),
        ("COK", "Kochi", "Kerala", "India"),
    ]

    inserted_count = 0
    for code, city, state, country in airports_data:
        existing = db.query(Airport).filter(Airport.airport_code == code).first()
        if not existing:
            db.add(Airport(airport_code=code, city=city, state=state, country=country))
            inserted_count += 1
    db.commit()

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

def override_get_current_customer():
    return {'username':'Aravind', 'id':1, 'role':'admin'}



client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_db_and_load_airports():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        load_airports(db)
        db.commit()
    finally:
        db.close()

@pytest.fixture
def test_customer():
    db=TestingSessionLocal()
    try:
        db.query(Customer).filter(Customer.id == 1).delete()
        db.query(Customer).filter(Customer.email == "aravind@gmail.com").delete()
        db.flush()
    except Exception:
        pass
    customer = Customer(
        username="Aravind",
        email="aravind@gmail.com",
        role="admin",
        address="BLR",
        mobile_number="1234567890",
        hashed_password=bcrypt_context.hash("test1234")
    )
    db.add(customer)
    db.commit()
    yield customer
    with engine.connect() as connection:
        connection.execute(text("DELETE FROM customer;"))
        connection.commit()

@pytest.fixture
def test_ticket():
    db=TestingSessionLocal()
    if not db.query(Customer).filter(Customer.id == 1).first():
        db.add(Customer(
            id=1,
            username="Aravind",
            email="aravind@gmail.com",
            role="admin",
            address="BLR",
            mobile_number="1234567890",
            hashed_password=bcrypt_context.hash("test1234")
        ))
        db.commit()
   
    db.query(Ticket).filter(Ticket.ticket_number == 1).delete()
    db.commit()
    ticket = Ticket(
        ticket_number=1,
        customer_id=1,
        origin="DEL",
        destination="HYD",
        class_type="Economy",
        meal_included="Yes"
    )
    db.add(ticket)
    db.commit()
    try:
        yield ticket
    finally:
        db.close()
    with engine.connect() as connection:
        connection.execute(text("DELETE FROM ticket;"))
        connection.commit()

@pytest.fixture
def test_luggage():
    db=TestingSessionLocal()
    if not db.query(Customer).filter(Customer.id == 1).first():
        db.add(Customer(
            id=1,
            username="Aravind",
            email="aravind@gmail.com",
            role="admin",
            address="BLR",
            mobile_number="1234567890",
            hashed_password=bcrypt_context.hash("test1234")
        ))
        db.commit()
    if not db.query(Ticket).filter(Ticket.ticket_number == 1).first():
        db.add(Ticket(
            ticket_number=1,
            customer_id=1,
            origin="DEL",
            destination="HYD",
            class_type="Economy",
            meal_included="Yes"
        ))
        db.commit()
    # remove any existing luggage with same PK
    db.query(Luggage).filter(Luggage.id == 1).delete()
    db.commit()
    luggage = Luggage(
        id=1,
        ticket_id=1,
        weight=10,
        size="Medium"
    )
    db.add(luggage)
    db.commit()
    try:
        yield luggage
    finally:
        db.close()
    with engine.connect() as connection:
        connection.execute(text("DELETE FROM luggage;"))
        connection.commit()

@pytest.fixture
def test_luggage_tracking():
    db=TestingSessionLocal()
    if not db.query(Customer).filter(Customer.id == 1).first():
        db.add(Customer(
            id=1,
            username="Aravind",
            email="aravind@gmail.com",
            role="admin",
            address="BLR",
            mobile_number="1234567890",
            hashed_password=bcrypt_context.hash("test1234")
        ))
        db.commit()
    if not db.query(Ticket).filter(Ticket.ticket_number == 1).first():
        db.add(Ticket(
            ticket_number=1,
            customer_id=1,
            origin="DEL",
            destination="HYD",
            class_type="Economy",
            meal_included="Yes"
        ))
        db.commit()
    if not db.query(Luggage).filter(Luggage.id == 1).first():
        db.add(Luggage(
            id=1,
            ticket_id=1,
            weight=10,
            size="Medium"
        ))
        db.commit()

    db.query(LuggageTracking).filter(LuggageTracking.luggage_id == 1).delete()
    db.commit()
    luggage_tracking = LuggageTracking(
        luggage_id=1,
        last_location="DEL",
        scan_datetime=datetime(2021, 1, 1, 0, 0, 0),
        next_destination="HYD",
        status="NEW"
    )
    db.add(luggage_tracking)
    db.commit()
    try:
        yield luggage_tracking
    finally:
        db.close()
    with engine.connect() as connection:
        connection.execute(text("DELETE FROM luggage_tracking;"))
        connection.commit()