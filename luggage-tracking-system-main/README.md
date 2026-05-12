## FastAPI Caselet - Airline Luggage Tracking

A minimal FastAPI backend demonstrating authentication, customer/ticket management, and admin-driven luggage tracking with explicit workflow states.

### Tech stack

- FastAPI, Python
- SQLAlchemy 2.x ORM
- PostgreSQL (development) and SQLite (tests)
- Pytest for tests

### Project structure

```
.
├─ main.py                   # FastAPI app factory and routers
├─ database.py               # SQLAlchemy engine/session base
├─ models.py                 # ORM models
├─ utils.py                  # DB dependency, status logic, constants
├─ routers/
│  ├─ auth.py               # signup/login, JWT
│  ├─ customers.py          # customer CRUD and queries
│  └─ admin.py              # admin-only management endpoints
└─ test/                    # pytest suite (uses SQLite)
```

### Setup (local)

1. Create and activate a virtualenv

```bash
python3 -m venv venv
source venv/bin/activate
```

2. Install dependencies

```bash
pip install -r requirements.txt
```

3. Configure and initialize the database

- Edit `database.py` to point to your own Postgres instance:
  - `SQLALCHEMY_DATABASE_URL = 'postgresql://<user>:<password>@<host>:<port>/<db>'`
- Ensure your Postgres database exists and your user has the necessary privileges.
- **Create tables for all models** before running the application. You can:
  - Use pgAdmin to run the `CREATE TABLE` statements for the models (`customer`, `airport`, `ticket`, `luggage`, `luggage_tracking`)
  - Or, from a Python shell or script with your models and engine imported, run:
    ```python
    from database import Base, engine
    Base.metadata.create_all(bind=engine)
    ```
- **Populate the `Airport` table with data** before using the app. This is required for ticket and luggage operations. For example, using pgAdmin or the terminal (`psql`):

  ```sql
  INSERT INTO airport (airport_code, city, state, country) VALUES
  ('DEL', 'Delhi', 'Delhi', 'India'),
  ('BOM', 'Mumbai', 'Maharashtra', 'India'),
  ('BLR', 'Bengaluru', 'Karnataka', 'India'),
  ('MAA', 'Chennai', 'Tamil Nadu', 'India'),
  ('HYD', 'Hyderabad', 'Telangana', 'India');
  ```

  - This population step is mandatory. The app will not work unless the `Airport` table contains data.


4. Run the server

```bash
uvicorn main:app --reload
```

Server will be available at `http://127.0.0.1:8000`. Open the interactive docs at `http://127.0.0.1:8000/docs`.

### Auth

- Register: `POST /auth/` (admin or customer; tests use an admin user)
- Login: `POST /auth/token` (OAuth2 password flow). Use the returned bearer token for subsequent requests.

### Roles

- Admin: Full control over customers, tickets, luggage and tracking.
- Customer: Can view their own profile, tickets, luggage and tracking; cannot modify tracking.

### Luggage workflow (single `status` + `assigned` flag)

- Initial: `NEW`
- Assignment: set `assigned=true` ⇒ status becomes `ASSIGNED` (computed)
- Scanning: when `scan_datetime` is set (a scan event occurred) and current status is `ASSIGNED` ⇒ status becomes `VERIFIED` (computed). If a scan failure occurs, set `status=FAILED` explicitly.
- Arrival: when status is `VERIFIED` and `last_location == destination` ⇒ status becomes `APPROVED` (computed). `REJECTED` is an explicit admin decision in exceptional cases.

Status constants are in `utils.VALID_STATUSES`.

### Example flows

1. User registers an account and obtains authorization (logs in to receive a bearer token).
2. User creates a ticket.
3. Admin creates luggage (auto-creates tracking row with `NEW` and `assigned=false`).
4. Admin assigns luggage:

```http
PUT /admin/luggage-tracking/1
{"assigned": true}
```

5. Admin records a scan:

```http
PUT /admin/luggage-tracking/1
{"scan_datetime": "2025-10-17T14:05:00Z", "last_location": "BOM"}
```

If the scan is successful, status is bumped to `VERIFIED`. To indicate a scan failure, send `{"scan_datetime": "...", "status": "FAILED"}`.

6. When the luggage reaches the destination and its status is `VERIFIED`, it will automatically become `APPROVED`.

### Running tests

```bash
python -m pytest -q
```

