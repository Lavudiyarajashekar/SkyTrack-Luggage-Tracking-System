from test.helper import client, override_get_current_customer, override_get_db, test_customer, test_ticket, test_luggage, test_luggage_tracking
from routers.auth import get_current_customer
from utils import get_db
from models import Customer
from fastapi import status
from main import app

app.dependency_overrides[get_current_customer] = override_get_current_customer
app.dependency_overrides[get_db] = override_get_db

def test_get_customer_info(test_customer):
    response = client.get("/customers/")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()['username'] == "Aravind"
    assert response.json()['email'] == "aravind@gmail.com"
    assert response.json()['role'] == "admin"
    assert response.json()['address'] == "BLR"
    assert response.json()['mobile_number'] == "1234567890"

def test_change_password(test_customer):
    request_body = {
        "password": "test1234",
        "new_password": "test12345"
    }
    response = client.put("/customers/password",json=request_body)
    assert response.status_code == status.HTTP_204_NO_CONTENT

def test_create_ticket(test_ticket):
    request_body = {
        "origin": "DEL",
        "destination": "HYD",
        "class_type": "Economy",
        "meal_included": "Yes"
    }
    response = client.post("/customers/tickets", json=request_body)
    assert response.status_code == status.HTTP_201_CREATED

def test_get_all_tickets(test_ticket):
    response = client.get("/customers/tickets")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1

def test_get_ticket(test_ticket):
    response = client.get("/customers/tickets/1")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()['origin'] == "DEL"
    assert response.json()['destination'] == "HYD"
    assert response.json()['class_type'] == "Economy"

def test_update_ticket(test_ticket):
    request_body = {
        "origin": "DEL",
        "destination": "BOM",
        "class_type": "Economy",
        "meal_included": "Yes"
    }
    response = client.put("/customers/tickets/1", json=request_body)
    assert response.status_code == status.HTTP_204_NO_CONTENT

def test_get_all_luggage(test_luggage):
    response = client.get("/customers/luggage")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1

def test_get_luggage(test_luggage):
    response = client.get("/customers/luggage/1")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()['weight'] == 10
    assert response.json()['size'] == "Medium"
    assert response.json()['ticket_id'] == 1

def test_get_all_luggage_tracking(test_luggage_tracking):
    response = client.get("/customers/luggage-tracking")
    assert response.status_code == status.HTTP_200_OK
    
def test_get_luggage_status_by_ticket(test_luggage_tracking):
    response = client.get("/customers/luggage-tracking/status/1")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data['ticket_id'] == 1
    assert 'origin' in data
    assert 'destination' in data
    assert 'luggage_count' in data
    assert 'luggages' in data
    assert len(data['luggages']) >= 1
    assert data['luggages'][0]['luggage_id'] == 1
    assert 'status' in data['luggages'][0]