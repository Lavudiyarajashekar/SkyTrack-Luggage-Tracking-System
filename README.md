# SkyTrack — Real-Time Airline Luggage Tracking System

![SkyTrack Banner](https://img.shields.io/badge/Status-Active-brightgreen) ![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688) ![Next.js](https://img.shields.io/badge/Frontend-Next.js_14-black) ![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC) ![Docker](https://img.shields.io/badge/Deploy-Docker-2496ED)

SkyTrack is a full-stack, production-ready airline luggage tracking system. It provides an end-to-end solution for both **Passengers** (to track their bags globally in real-time) and **Airport Operations** (to register and scan bags seamlessly through various security and logistics checkpoints).

---

## ✨ Key Features

### For Customers
*   **Instant Ticket Booking**: Select an origin and destination to automatically generate a digital ticket.
*   **Live Tracking Dashboard**: A visually stunning, glassmorphic dashboard featuring an animated flight map.
*   **Real-time Timeline Feed**: Watch your luggage pass through checkpoints (Check-in, Security, Loading, Transfer, Delivery) in real-time.

### For Admin & Airport Operations
*   **Pending Intake Queue**: Automatically identifies passengers who have booked tickets but haven't dropped off their luggage.
*   **One-Click Registration**: Process luggage intakes instantly without manually entering long ticket numbers.
*   **Fast-Action Scan Console**: Instantly update luggage statuses (`SECURITY_SCAN`, `LOADED`, `TRANSFERRED`) with interactive buttons that dynamically lock out completed steps.
*   **Live Monitor Feed**: Keep track of the entire airport's luggage throughput with real-time statistics and tables.
*   
## 🛠️ Tech Stack

### Frontend (User Interface)
*   **Framework**: Next.js (React)
*   **Styling**: Tailwind CSS v4 (Custom Glassmorphism Design System)
*   **Animations**: Framer Motion
*   **Icons**: Lucide React

### Backend (API & Database)
*   **Framework**: FastAPI (Python)
*   **Database**: PostgreSQL
*   **ORM**: SQLAlchemy
*   **Authentication**: JWT (JSON Web Tokens) with Role-Based Access Control

### DevOps & Deployment
*   **Containerization**: Docker & Docker Compose
*   **Orchestration**: Kubernetes (K8s Deployments, Services, ConfigMaps, HPA)

---

## 🚀 Getting Started (Local Development)

The easiest way to run the entire application stack locally is via **Docker Compose**.

### Prerequisites
*   [Docker](https://docs.docker.com/get-docker/) and Docker Compose installed.

### Run the App
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/skytrack.git
   cd skytrack
   ```
2. Build and start the containers:
   ```bash
   docker-compose up --build
   ```
3. Access the application:
   *   **Frontend UI**: `http://localhost:3000`
   *   **Backend API Docs (Swagger)**: `http://localhost:8000/docs`

> **Note:** The backend automatically runs database migrations and seeds initial airport data on startup.

---

## 💻 Manual Setup (Without Docker)

If you prefer to run the services independently without Docker:

### 1. Backend Setup
```bash
cd luggage-tracking-system-main
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
*(Requires a running PostgreSQL instance on `localhost:5432`)*

### 2. Frontend Setup
```bash
cd baggage-tracker-ui
npm install
npm run dev
```

---

## 🌐 Deployment (Taking it Live)

To deploy this project to the internet so anyone can access it, you have a few options:

### Option A: PaaS (Recommended for Portfolios)
1.  **Database**: Host your PostgreSQL database on **Supabase** or **Neon**. Update your `.env` file with the connection string.
2.  **Backend**: Deploy your FastAPI application to **Render.com** or **Railway.app** as a Web Service. Ensure you set the `DATABASE_URL` environment variable.
3.  **Frontend**: Deploy the Next.js app to **Vercel.com**. Link your GitHub repository, and set `NEXT_PUBLIC_API_URL` to your newly deployed Backend URL.

### Option B: VPS Deployment (Using Docker)
1.  Rent a cheap VPS from **DigitalOcean** or **Linode** (Ubuntu 22.04).
2.  SSH into your server and install Docker.
3.  Clone this repository onto the server.
4.  Run `docker-compose up -d --build`.
5.  *(Optional)* Set up an Nginx reverse proxy with SSL via Let's Encrypt to map the ports to a domain name.

---
<img width="1918" height="1032" alt="Screenshot 2026-05-12 140216" src="https://github.com/user-attachments/assets/75d53b6e-5626-4f20-8e29-be6a4de5a265" />
<img width="1918" height="1037" alt="Screenshot 2026-05-12 140230" src="https://github.com/user-attachments/assets/d2ff3252-40b3-4e89-9087-b217e0b96f8b" />
<img width="1918" height="1031" alt="Screenshot 2026-05-12 140312" src="https://github.com/user-attachments/assets/7a428bfa-790c-4b86-9bf8-77021c3a9372" />
<img width="1918" height="1027" alt="Screenshot 2026-05-12 140334" src="https://github.com/user-attachments/assets/c552fec5-9322-497f-85db-5351d4fecc7e" />
<img width="1918" height="1005" alt="Screenshot 2026-05-12 140415" src="https://github.com/user-attachments/assets/2a8f10c1-27c5-498a-b209-90ffc5b1256f" />
<img width="1918" height="1036" alt="Screenshot 2026-05-12 140454" src="https://github.com/user-attachments/assets/bd4bea2d-7fda-4ff0-81f9-98a4208a0108" />



## 📜 License
This project is licensed under the MIT License.
