import os
from fastapi import FastAPI
from routers import customers, auth, admin
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from models import Airport

# Auto-create tables
Base.metadata.create_all(bind=engine)

def seed_airports():
    db = SessionLocal()
    if db.query(Airport).count() == 0:
        airports = [
            Airport(airport_code='DEL', city='Delhi', state='Delhi', country='India'),
            Airport(airport_code='BOM', city='Mumbai', state='Maharashtra', country='India'),
            Airport(airport_code='BLR', city='Bengaluru', state='Karnataka', country='India'),
            Airport(airport_code='MAA', city='Chennai', state='Tamil Nadu', country='India'),
            Airport(airport_code='HYD', city='Hyderabad', state='Telangana', country='India'),
        ]
        db.bulk_save_objects(airports)
        db.commit()
    db.close()

seed_airports()

app = FastAPI()

app.add_middleware(
   CORSMiddleware,
   allow_origins=["*"],
   allow_credentials=True,
   allow_methods=["*"],
   allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Airline Luggage Tracking API Running"}

app.include_router(admin.router)
app.include_router(auth.router)
app.include_router(customers.router)