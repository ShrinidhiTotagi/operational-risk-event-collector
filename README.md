# Tool-66 — Operational Risk Event Collector

> Capstone Project | Sprint: 14 April – 9 May 2026 | Demo Day: 9 May 2026

An AI-powered full-stack web application for collecting, managing, and analyzing operational risk events in real time.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER                                  │
│                  http://localhost:5173                           │
│              React 18 + Vite + Tailwind CSS                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP / Axios
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SPRING BOOT BACKEND                           │
│                   http://localhost:8080                         │
│   REST API │ Spring Security + JWT │ Spring AOP Audit Log       │
│   Flyway Migrations │ Redis Cache │ CSV Export │ File Upload    │
└──────┬──────────────────────────────────────┬───────────────────┘
       │ JDBC / JPA                           │ HTTP RestTemplate
       ▼                                      ▼
┌─────────────────┐              ┌────────────────────────────────┐
│   PostgreSQL 15 │              │      FLASK AI SERVICE          │
│   port 5433     │              │      http://localhost:5000      │
│   risk_events_db│              │  /describe  /recommend         │
└─────────────────┘              │  /generate-report  /analyze    │
                                 │  /chat  flask-limiter 30req/min│
┌─────────────────┐              └──────────────┬─────────────────┘
│    Redis 7      │                             │ HTTPS
│    port 6379    │                             ▼
│  AI Response    │              ┌────────────────────────────────┐
│  Cache 15min TTL│              │   GROQ API (LLaMA-3.3-70b)     │
└─────────────────┘              │   console.groq.com             │
                                 └────────────────────────────────┘
```

---

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Java | 17 | Backend language |
| Spring Boot | 3.x | REST API framework |
| PostgreSQL | 15 | Primary database |
| Redis | 7 | Cache (AI responses, sessions) |
| Flyway | — | Database migrations |
| Spring Security + JWT | — | Authentication & RBAC |
| Python | 3.10 | AI service language |
| Flask | 3.x | AI microservice framework |
| Groq API (LLaMA-3.3-70b) | — | AI model |
| flask-limiter | — | Rate limiting (30 req/min) |
| React | 18 | Frontend framework |
| Vite | — | Frontend build tool |
| Tailwind CSS | — | Utility CSS |
| Axios | — | HTTP client |
| Recharts | — | Dashboard charts |
| Docker + Docker Compose | — | Container orchestration |

---

## Prerequisites

- **Docker Desktop** — [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
- **Docker Compose** — included with Docker Desktop
- **Git** — [git-scm.com](https://git-scm.com)
- **Groq API Key** — free at [console.groq.com](https://console.groq.com) (no credit card required)

Optional (for local development without Docker):
- Java 17+ — [adoptium.net](https://adoptium.net)
- Node.js 20+ — [nodejs.org](https://nodejs.org)
- Python 3.10+ — [python.org](https://python.org)

---

## Setup Instructions

### 1. Clone the repository
```bash
git clone <repository-url>
cd operational-risk-event-collector
```

### 2. Configure environment variables
```bash
cp .env.example .env
```

Open `.env` and set your values:
```env
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=risk_events_db
GROQ_API_KEY=your_groq_api_key_here
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=your_minimum_64_character_secret_key_here_replace_this_value
```

Generate a secure JWT secret:
```bash
openssl rand -base64 64
```

### 3. Start all services
```bash
docker-compose up --build
```

First build takes 3–5 minutes (downloads dependencies). Subsequent starts are faster.

### 4. Access the application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend Swagger UI | http://localhost:8080/swagger-ui.html |
| AI Service Health | http://localhost:5000/health |

### 5. Default credentials

Register a new account at http://localhost:5173 or via:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@1234"}'
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|---------|-------------|
| `DB_USER` | Yes | PostgreSQL username |
| `DB_PASSWORD` | Yes | PostgreSQL password |
| `DB_NAME` | Yes | PostgreSQL database name |
| `GROQ_API_KEY` | Yes | Groq API key from console.groq.com |
| `REDIS_HOST` | Yes | Redis hostname (use `redis` in Docker) |
| `REDIS_PORT` | Yes | Redis port (default: 6379) |
| `JWT_SECRET` | Yes | JWT signing secret (minimum 64 characters) |

---

## Features

- **Complete CRUD** — Create, read, update, soft-delete risk events
- **JWT Authentication** — Secure login with role-based access (USER / ADMIN)
- **AI Analysis** — Real-time risk scoring, root cause analysis, recommendations via Groq LLaMA-3.3-70b
- **AI Chat** — Ask follow-up questions about any risk event
- **AI Report Generation** — Generate structured risk assessment reports
- **Dashboard** — KPI cards, Recharts visualizations, analytics
- **Search & Filter** — Debounced search, status/severity/category filters
- **Audit Logging** — Spring AOP logs all CREATE/UPDATE/DELETE with actor and timestamp
- **CSV Export** — Export all events to CSV
- **File Upload** — Upload CSV files to bulk import events
- **Redis Caching** — AI responses cached for 15 minutes
- **Rate Limiting** — AI service limited to 30 requests/minute per IP
- **Responsive Design** — Works on mobile, tablet, and desktop

---

## AI Service Endpoints

| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/analyze` | Full risk analysis with score, likelihood, impact |
| POST | `/api/describe` | Professional description of a risk event |
| POST | `/api/recommend` | 3 prioritized action recommendations |
| POST | `/api/generate-report` | Structured risk assessment report |
| POST | `/api/chat` | Conversational AI about a specific event |
| GET | `/health` | Service health check |

---

## Stopping the Application

```bash
# Stop all containers
docker-compose down

# Stop and remove all data (fresh start)
docker-compose down -v
docker-compose up --build
```

---

## Running Tests

**Backend (JUnit):**
```bash
cd backend
./mvnw test
```

**AI Service (Pytest):**
```bash
cd ai-service
pip install pytest
pytest tests/ -v
```

---

## Security

See [SECURITY.md](./SECURITY.md) for the full threat model, security controls, and penetration test findings.

See [PENETRATION_TESTING_REPORT.md](./PENETRATION_TESTING_REPORT.md) for the full live security assessment conducted on 9 May 2026.

---

## Project Structure

```
operational-risk-event-collector/
├── backend/                          ← Spring Boot (Java 17)
│   ├── src/main/java/com/internship/tool/
│   │   ├── controller/               ← REST endpoints
│   │   ├── service/                  ← Business logic
│   │   ├── repository/               ← JPA queries
│   │   ├── entity/                   ← JPA models
│   │   ├── config/                   ← Security, Redis
│   │   ├── security/                 ← JWT filter & util
│   │   ├── aop/                      ← Audit logging
│   │   └── exception/                ← Custom exceptions
│   └── src/main/resources/
│       ├── db/migration/             ← V1__init.sql, V2__, V3__
│       └── application.yml
├── ai-service/                       ← Flask (Python 3.10)
│   ├── routes/api.py                 ← All endpoints
│   ├── services/groq_client.py       ← Groq API client
│   ├── prompts/                      ← Prompt templates
│   └── tests/test_api.py             ← 8 pytest tests
├── frontend/                         ← React 18 + Vite
│   └── src/
│       ├── pages/                    ← Dashboard, Events, Analytics
│       ├── components/               ← Reusable UI components
│       └── services/api.js           ← Axios API client
├── docker-compose.yml
├── .env.example
├── SECURITY.md
└── PENETRATION_TESTING_REPORT.md
```

---

*Tool-66 — Operational Risk Event Collector | Capstone Sprint: 14 April – 9 May 2026*
