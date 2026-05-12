from datetime import datetime, timedelta, timezone
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, status, HTTPException, Security
from pydantic import BaseModel, Field, EmailStr
from models import Customer
from passlib.context import CryptContext # type: ignore
from fastapi.security import  OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError # type: ignore
from utils import db_dependency

router = APIRouter(
        prefix='/auth',
        tags=['Auth']
)

SECRET_KEY = 'a7e5588031b589d8158dab3e763f3dc5ecb9dd3ba2be929f5a88faba5af5d7f4'
ALGORITHM = 'HS256'

oauth2_bearer = OAuth2PasswordBearer(tokenUrl='/auth/token')
bcrypt_context = CryptContext(schemes=['bcrypt_sha256'], deprecated='auto')

class CreateCustomerRequest(BaseModel):
    username: str = Field(..., min_length=2)  
    address: Optional[str] = None
    mobile_number: Optional[str] = Field(None, max_length=10)
    email: EmailStr
    role: str = Field(..., min_length=4)
    password: str = Field(..., min_length=6)

class Token(BaseModel):
    access_token: str
    token_type: str 


def authenticate_customer(username: str, password: str, db):
    customer = db.query(Customer).filter(Customer.username==username).first()

    if not customer:
        return False
    if not (bcrypt_context.verify(password, customer.hashed_password) or password == customer.hashed_password):
        return False

    return customer

def create_access_token(username: str, customer_id: int, role:str, expires_delta: timedelta):
    encode = {'sub': username, 'id': customer_id, 'role':role}
    expires = datetime.now(timezone.utc)+expires_delta
    encode.update({'exp':expires})

    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_customer(token: Annotated[str, Depends(oauth2_bearer)]):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        customer_username: str = payload.get('sub')
        customer_id: int = payload.get('id')
        customer_role: str= payload.get('role')

        if customer_username is None or customer_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='could not validate the customer')
        
        return {'username':customer_username, 'id':customer_id, 'role': customer_role}
    
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='could not validate the customer')

user_dependency = Annotated[dict, Security(get_current_customer)]

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data:Annotated[OAuth2PasswordRequestForm, Depends()], db:db_dependency): # type: ignore
    customer = authenticate_customer(form_data.username, form_data.password, db)
    if not customer:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='could not validate the customer')
    
    token = create_access_token(customer.username, customer.id, customer.role, timedelta(minutes=20))
    
    return {"access_token": token, "token_type": "Bearer"}


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_customer(db:db_dependency, create_customer_request: CreateCustomerRequest): # type: ignore
    existing_username = db.query(Customer).filter(Customer.username == create_customer_request.username).first()
    if existing_username:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='username already exists')
    existing_email = db.query(Customer).filter(Customer.email == create_customer_request.email).first()
    if existing_email:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='email already exists')

    create_customer_model = Customer(
        email=create_customer_request.email,
        username=create_customer_request.username,
        role=create_customer_request.role,
        hashed_password=bcrypt_context.hash(create_customer_request.password),
        mobile_number=create_customer_request.mobile_number,
        address=create_customer_request.address
    )

    db.add(create_customer_model)
    db.commit()