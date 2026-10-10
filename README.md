# SafePod / SafeDrive - Kinetic Road Safety Platform

> Converting real-time vehicle telematics and road safety into status, driver rewards, and measurable life-saving impact.

---

## 🌟 Key Features

- **Kinetic Radar & Speed Zone Enforcement**: Real-time GPS mapping with automated zonal speed limit detection, dynamic corridors, and community hazard pins (radar cameras, accident blackspots, potholes, EV fast chargers).
- **Multi-Sensor Collision Detection**: 50Hz sensor fusion pipeline combining G-force accelerometer peaks, motorcycle lean/tilt angle analysis, and rapid velocity drops.
- **Automated ICE Emergency Dispatch**: 10-second zero-touch emergency countdown with auto-dispatch of SMS & phone alerts to nominated emergency contacts with exact GPS coordinates.
- **Kinetic Buffer & Distraction Monitoring**: Live scoring tracking following distance buffer (in seconds) and phone screen interaction penalties.
- **Squads & SafeDriver Gamification**: Community leaderboards, streak rewards, and marketplace redemption for verified safe drivers.

---

## 🚀 Quick Start

### Frontend (Vite + React)
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run at `http://localhost:3000`.

### Backend (FastAPI + PostgreSQL)
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API docs will be available at `http://localhost:8000/docs`.

### Full Stack via Docker
```bash
docker-compose up --build
```
