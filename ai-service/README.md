# AI Service — Tool-66 Operational Risk Event Collector

Flask microservice providing AI-powered risk analysis using Groq API (LLaMA-3.3-70b).

---

## Setup

### Environment Variables

| Variable | Required | Description |
|----------|---------|-------------|
| `GROQ_API_KEY` | Yes | API key from console.groq.com |

### Run with Docker (recommended)
```bash
# From project root
docker-compose up ai-service
```

### Run locally
```bash
cd ai-service
pip install -r requirements.txt
export GROQ_API_KEY=your_key_here
python app.py
```

Service runs on **http://localhost:5000**

---

## API Reference

### GET /health
Health check.
```json
{"status": "healthy", "service": "ai-service"}
```

---

### POST /api/analyze
Full risk analysis with score, likelihood, impact, root causes, and recommendations.

**Request:**
```json
{
  "title": "Unauthorized Database Access",
  "description": "A contractor accessed production DB outside approved hours.",
  "category": "IT",
  "severity": "CRITICAL",
  "status": "OPEN"
}
```

**Response:**
```json
{
  "score": 85,
  "risk_level": "HIGH",
  "likelihood": "LIKELY",
  "impact": "MAJOR",
  "analysis": "This event represents a significant security breach...",
  "root_causes": ["Weak access controls", "No MFA", "Shared credentials"],
  "suggested_actions": [
    {"priority": "IMMEDIATE", "action": "Revoke contractor access"},
    {"priority": "SHORT_TERM", "action": "Implement MFA"},
    {"priority": "LONG_TERM", "action": "Deploy PAM solution"}
  ],
  "regulatory_flags": ["GDPR Article 32", "ISO 27001"],
  "estimated_resolution_days": 7,
  "similar_risk_patterns": "Common insider threat pattern",
  "confidence": 88
}
```

---

### POST /api/describe
Professional description of a risk event.

**Request:**
```json
{
  "title": "Payroll Processing Failure",
  "description": "Monthly payroll batch job failed due to SFTP misconfiguration.",
  "category": "FINANCE"
}
```

**Response:**
```json
{
  "summary": "A critical payroll processing failure occurred...",
  "risk_type": "Operational",
  "affected_area": "Finance / HR",
  "key_indicators": ["System failure", "Process gap", "Vendor dependency"],
  "generated_at": "2026-05-09T12:00:00Z",
  "is_fallback": false
}
```

---

### POST /api/recommend
Three prioritized action recommendations.

**Request:**
```json
{
  "title": "Data Leak",
  "description": "Employee sent sensitive data to external email.",
  "category": "HR",
  "severity": "HIGH"
}
```

**Response:**
```json
{
  "recommendations": [
    {"action_type": "IMMEDIATE", "description": "Recall the email and notify DPO", "priority": "HIGH"},
    {"action_type": "SHORT_TERM", "description": "Conduct DLP policy review", "priority": "MEDIUM"},
    {"action_type": "LONG_TERM", "description": "Implement email DLP controls", "priority": "LOW"}
  ],
  "generated_at": "2026-05-09T12:00:00Z",
  "is_fallback": false
}
```

---

### POST /api/generate-report
Structured risk assessment report for multiple events.

**Request:**
```json
{
  "events": [
    {"title": "DB Breach", "description": "...", "severity": "CRITICAL", "category": "IT"},
    {"title": "Payroll Failure", "description": "...", "severity": "HIGH", "category": "FINANCE"}
  ]
}
```

**Response:**
```json
{
  "title": "Operational Risk Assessment Report",
  "summary": "Two significant risk events identified...",
  "overview": "The organisation faces elevated risk...",
  "key_findings": ["Finding 1", "Finding 2", "Finding 3"],
  "recommendations": ["Rec 1", "Rec 2", "Rec 3"],
  "risk_level": "HIGH",
  "generated_at": "2026-05-09T12:00:00Z",
  "is_fallback": false
}
```

---

### POST /api/chat
Conversational AI about a specific event.

**Request:**
```json
{
  "event": {"title": "DB Breach", "description": "...", "severity": "CRITICAL"},
  "history": [],
  "message": "What are the regulatory implications of this event?"
}
```

**Response:**
```json
{"reply": "This event may trigger GDPR Article 33 notification requirements..."}
```

---

## Rate Limiting

All endpoints are limited to **30 requests per minute per IP** via flask-limiter. Exceeding this returns HTTP 429.

## Running Tests

```bash
pip install pytest
pytest tests/ -v
```

Tests use mocked Groq API — no live network access required.
