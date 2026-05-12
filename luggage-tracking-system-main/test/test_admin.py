from test.helper import *
from fastapi import status
from routers.auth import get_current_customer
from utils import get_db, VALID_STATUSES
from main import app

app.dependency_overrides[get_current_customer] = override_get_current_customer
app.dependency_overrides[get_db] = override_get_db

def test_get_all_customers(test_customer):
    response = client.get("/admin/customers")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1

def test_delete_customer(test_customer):
    response = client.delete("/admin/customers/1")
    assert response.status_code == status.HTTP_204_NO_CONTENT

def test_get_all_tickets(test_ticket):
    response = client.get("/admin/tickets")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1

def test_delete_ticket(test_ticket):
    response = client.delete("/admin/tickets/1")
    assert response.status_code == status.HTTP_204_NO_CONTENT

def test_create_luggage(test_ticket):
    request_body = {
        "ticket_id": 1,
        "weight": 10,
        "size": "Medium"
    }
    response = client.post("/admin/luggage", json=request_body)
    assert response.status_code == status.HTTP_201_CREATED

def test_get_all_luggage(test_luggage):
    response = client.get("/admin/luggage")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1

def test_delete_luggage(test_luggage):
    response = client.delete("/admin/luggage/1")
    assert response.status_code == status.HTTP_204_NO_CONTENT

def test_get_all_luggage_tracking(test_luggage_tracking):
    response = client.get("/admin/luggage-tracking")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1

def test_get_luggage_tracking(test_luggage_tracking):
    response = client.get("/admin/luggage-tracking/1")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()['luggage_id'] == 1
    assert response.json()['last_location'] == "DEL"
    assert response.json()['scan_datetime'] == "2021-01-01T00:00:00"
    assert response.json()['next_destination'] == "HYD"
    assert response.json()['status'] in VALID_STATUSES

def test_update_luggage_tracking(test_luggage_tracking):
    request_body = {
        "last_location": "BOM",
        "next_destination": "HYD"
    }
    response = client.put("/admin/luggage-tracking/1", json=request_body)
    assert response.status_code == status.HTTP_200_OK

    request_body = {
        "status": "ASSIGNED"
    }
    response = client.put("/admin/luggage-tracking/1", json=request_body)
    assert response.status_code == status.HTTP_200_OK

    request_body = {
        "last_location": "HYD",
        "status": "VERIFIED"
    }
    response = client.put("/admin/luggage-tracking/1", json=request_body)
    assert response.status_code == status.HTTP_200_OK

def test_delete_luggage_tracking(test_luggage_tracking):
    response = client.delete("/admin/luggage-tracking/1")
    assert response.status_code == status.HTTP_204_NO_CONTENT

def test_get_customer_luggage(test_luggage):
    response = client.get("/admin/customer-luggage/1")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()['all_reached'] == False

def test_get_luggage_by_status(test_luggage_tracking):
    response = client.get("/admin/status/NEW")   
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)

def test_get_customer_details_by_luggage(test_luggage):
    response = client.get("/admin/customer-details/1")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()['id'] == 1
    assert response.json()['username'] == "Aravind"
    assert response.json()['email'] == "aravind@gmail.com"
    assert response.json()['role'] == "admin"
    assert response.json()['address'] == "BLR"
    assert response.json()['mobile_number'] == "1234567890"
