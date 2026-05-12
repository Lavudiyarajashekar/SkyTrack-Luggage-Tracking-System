from test.helper import *
from fastapi import status
from routers.auth import get_current_customer, create_access_token, authenticate_customer, SECRET_KEY, ALGORITHM
from utils import get_db
from main import app
from jose import jwt
from datetime import timedelta

app.dependency_overrides[get_current_customer] = override_get_current_customer
app.dependency_overrides[get_db] = override_get_db

def test_create_customer(test_customer):
     
    db=TestingSessionLocal()
    authenticated_customer = authenticate_customer(test_customer.username, 'test1234', db)
    assert authenticated_customer is not None
    assert authenticated_customer.username == test_customer.username
    non_existent_customer = authenticate_customer("NonExistentCustomer", "test1234", db)
    assert non_existent_customer is False
    wrong_password_customer = authenticate_customer(test_customer.username, "test123456", db)
    assert wrong_password_customer is False

def test_login_for_access_token():
    username = 'Aravind'
    id = 1
    role = 'admin'
    expires_delta = timedelta(minutes=20)

    token = create_access_token(username, id, role, expires_delta)
    decoded_token = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM],options={'verify_signature': False})
    assert decoded_token is not None
    assert decoded_token['sub'] == username
    assert decoded_token['id'] == id
    assert decoded_token['role'] == role


