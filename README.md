# Tool66 - Operational Risk Event Collector

A full-stack web application for collecting, tracking, and managing operational risk events in organizations. Built for risk management teams in banks, financial institutions, and regulated industries.

---

## Features

- **Risk Event Management** — Create, view, update, and delete operational risk events
- **Risk Scoring** — Auto-calculates Inherent Risk Score (Likelihood × Impact)
- **AI-Powered** — Auto-generate descriptions, recommendations, and reports using LLaMA 3.3 via Groq
- **Role-Based Access** — ADMIN, RISK_OFFICER, VIEWER roles
- **Dashboard & Analytics** — Real-time charts, KPIs, and trend analysis
- **Audit Logging** — Tracks every action (who did what and when)
- **Export** — Export events to file for regulatory reporting
- **Demo Data** — Auto-seeds 30 sample events on first run

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Spring Boot 3.2 (Java 17) |
| Database | PostgreSQL 15 |
| Cache | Redis 7 |
| AI Service | Python Flask + Groq (LLaMA 3.3-70b) |
| Auth | JWT (JSON Web Token) |
| DB Migrations | Flyway |
| Container | Docker + Docker Compose |

---

## Project Structure

```
Tool66-Operational-Risk-Event-Collector/
├── frontend/          # React + Vite frontend
├── backend/           # Spring Boot backend
├── ai-service/        # Python Flask AI service
├── docker-compose.yml # Docker orchestration
└── .env.example       # Environment variables template
```

---

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/ShrinidhiTotagi/operational-Risk-Event-Collector.git
cd operational-Risk-Event-Collector
```

### 2. Setup environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in the required values:

```env
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret_min_32_chars
ADMIN_PASSWORD=your_admin_password
GROQ_API_KEY=your_groq_api_key
```

> Get a free Groq API key at https://console.groq.com

### 3. Run the project

```bash
docker-compose up --build
```

### 4. Open the app

```
http://localhost
```

Login with:
- **Username:** `admin`
- **Password:** value set in `ADMIN_PASSWORD` (default: `Admin@1234`)

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `postgres` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `tool66db` |
| `DB_USER` | Database user | `tool66user` |
| `DB_PASSWORD` | Database password | *(required)* |
| `REDIS_HOST` | Redis host | `redis` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_SECRET` | JWT signing secret | *(required)* |
| `JWT_EXPIRATION_MINUTES` | Token expiry | `60` |
| `MAIL_ENABLED` | Enable email sending | `false` |
| `MAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `MAIL_USERNAME` | SMTP username | *(optional)* |
| `MAIL_PASSWORD` | SMTP password | *(optional)* |
| `GROQ_API_KEY` | Groq API key for AI | *(required for AI)* |
| `AI_MODEL_ID` | AI model to use | `llama-3.3-70b-versatile` |
| `ENABLE_DEMO_SEED` | Seed 30 demo events | `false` |
| `ADMIN_USERNAME` | Default admin username | `admin` |
| `ADMIN_PASSWORD` | Default admin password | *(required)* |
| `ADMIN_EMAIL` | Default admin email | `admin@tool66.local` |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login and get JWT token |
| POST | `/auth/register` | Register new user (Admin only) |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | List all events (paginated, filterable) |
| POST | `/api/events` | Create new event |
| GET | `/api/events/:id` | Get single event |
| PUT | `/api/events/:id` | Update event |
| DELETE | `/api/events/:id` | Delete event |
| GET | `/api/events/stats` | Dashboard statistics |
| GET | `/api/events/export` | Export events |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/describe` | Generate event description |
| POST | `/api/ai/recommend` | Get mitigation recommendations |
| POST | `/api/ai/generate-report` | Generate full risk report |

---

## User Roles

| Role | Permissions |
|------|------------|
| `ROLE_ADMIN` | Full access — manage users and all events |
| `ROLE_RISK_OFFICER` | Create, edit, delete events |
| `ROLE_VIEWER` | Read-only access |

---

## Risk Event Fields

| Field | Description |
|-------|-------------|
| Title | Short name of the event |
| Category | Fraud, IT, Compliance, Legal, HR, etc. |
| Status | OPEN → IN_PROGRESS → CLOSED |
| Likelihood | 1 (rare) to 5 (almost certain) |
| Impact | 1 (negligible) to 5 (catastrophic) |
| Inherent Risk Score | Auto-calculated: Likelihood × Impact |
| Loss Amount | Financial loss in currency |
| Incident Date | When the event occurred |
| Discovery Date | When the event was discovered |
| Closure Date | When the event was resolved |
| Root Cause | Why the event happened |
| Control Failures | What controls failed |
| KRI | Key Risk Indicators to monitor |
| Action Plan | Steps to resolve and prevent recurrence |

---

## Screenshots

### Dashboard
- KPI cards showing total events, open events, total loss
- Risk by category chart
- Monthly loss trend chart

### Events List
- Searchable and filterable table
- Status badges (OPEN, IN_PROGRESS, CLOSED)
- Risk score indicators

### Event Detail
- Full event information
- AI-powered description and recommendations
- Edit and delete actions

---

## Development

### Run frontend locally

```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`

### Run backend locally

```bash
cd backend
mvn spring-boot:run
```
Backend runs at `http://localhost:8080`

### Run AI service locally

```bash
cd ai-service
pip install -r requirements.txt
python app.py
```
AI service runs at `http://localhost:5000`

---

## Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## License

This project is for educational and internship purposes.

---

## Author

**Shrinidhi Totagi**  
GitHub: [@ShrinidhiTotagi](https://github.com/ShrinidhiTotagi)
