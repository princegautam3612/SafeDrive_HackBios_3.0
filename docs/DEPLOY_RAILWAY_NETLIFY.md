# Production Deployment Guide: Railway (Backend) & Netlify (Frontend)

This guide walks through deploying the SafeDrive Kinetic Platform to production with a decoupled backend and frontend architecture.

---

## 1. Architecture Overview

- **Backend**: FastAPI + SQLAlchemy + PostgreSQL hosted on [Railway](https://railway.app)
- **Frontend**: Vite + React PWA hosted on [Netlify](https://netlify.com)
- **Database**: Managed PostgreSQL on Railway
- **Edge Routing**: Netlify rewrite rules proxy `/api/*` to the Railway backend URL

---

## 2. Deploying Backend to Railway

1. **Create a New Project on Railway**:
   - Go to [Railway Dashboard](https://railway.app/new).
   - Choose **Provision PostgreSQL**.
2. **Add FastAPI Service**:
   - Connect your GitHub repository.
   - Set the root directory / Dockerfile path to `backend/Dockerfile`.
   - Set environment variables:
     - `DATABASE_URL`: Automatically populated by Railway PostgreSQL reference `${{Postgres.DATABASE_URL}}`.
     - `SECRET_KEY`: A cryptographically secure 64-character string.
     - `PORT`: `8000`
3. **Verify Deployment**:
   - Test health check: `https://your-backend.up.railway.app/health` -> `{"status": "healthy"}`
   - Open OpenAPI documentation at `https://your-backend.up.railway.app/docs`.

---

## 3. Deploying Frontend to Netlify

1. **Create Site on Netlify**:
   - Connect repository in Netlify.
   - Build settings:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
2. **Configure Environment Variables**:
   - `VITE_API_URL`: `/api` (or `https://your-backend.up.railway.app/api`)
3. **Configure API Reverse Proxy in `netlify.toml`**:
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "https://your-backend.up.railway.app/api/:splat"
     status = 200
     force = true
   ```
4. **Trigger Deploy**:
   - Netlify will build the production bundle and deploy globally on edge CDN.

---

## 4. Local Full-Stack Development with Docker Compose

To test the entire production stack locally:

```bash
docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`
- Postgres: `localhost:5432`
