# Security Policy

## Overview

Tool66 - Operational Risk Event Collector implements multiple layers of security to protect sensitive financial and risk data. This document describes the security features, policies, and how to report vulnerabilities.

---

## Security Features

### 1. JWT Authentication

All API endpoints (except `/auth/login` and `/actuator/health`) are protected by JWT (JSON Web Token) authentication.

**Implementation:** `backend/src/main/java/com/internship/tool/config/JwtAuthFilter.java`

- Every request must include a valid JWT token in the `Authorization: Bearer <token>` header
- Tokens are signed using HMAC-SHA256 algorithm
- Token expiry is configurable via `JWT_EXPIRATION_MINUTES` (default: 60 minutes)
- Expired or tampered tokens are rejected with `401 Unauthorized`
- Passwords are hashed using BCrypt before storage — plain text passwords are never stored

**How it works:**
```
Client → POST /auth/login → Server validates credentials → Returns JWT token
Client → GET /api/events → JwtAuthFilter validates token → Grants or denies access
```

---

### 2. Role-Based Access Control (RBAC)

Three roles control what each user can do:

| Role | Permissions |
|------|------------|
| `ROLE_ADMIN` | Full access — manage users, create/edit/delete all events |
| `ROLE_RISK_OFFICER` | Create, edit events (cannot delete) |
| `ROLE_VIEWER` | Read-only access to events and dashboard |

**Implementation:** `backend/src/main/java/com/internship/tool/config/SecurityConfig.java`

```java
.requestMatchers(HttpMethod.GET, "/api/events/**").hasAnyRole("ADMIN", "RISK_OFFICER", "VIEWER")
.requestMatchers(HttpMethod.POST, "/api/events/**").hasAnyRole("ADMIN", "RISK_OFFICER")
.requestMatchers(HttpMethod.PUT, "/api/events/**").hasAnyRole("ADMIN", "RISK_OFFICER")
.requestMatchers(HttpMethod.DELETE, "/api/events/**").hasRole("ADMIN")
```

Unauthorized access returns `403 Forbidden`.

---

### 3. Input Validation

All incoming data is validated before processing.

**Implementation:** `backend/src/main/java/com/internship/tool/dto/EventRequest.java`

| Field | Validation Rule |
|-------|----------------|
| Title | Not blank, max 255 characters |
| Status | Must be OPEN, IN_PROGRESS, CLOSED, or MONITORING |
| Category | Not blank, max 50 characters |
| Likelihood | Integer between 1 and 5 |
| Impact | Integer between 1 and 5 |
| Loss Amount | Decimal, minimum 0.00 |
| Currency | Max 3 characters |

Invalid input returns `400 Bad Request` with field-level error messages.

---

### 4. Rate Limiting (Flask Limiter)

The AI service is protected by rate limiting to prevent abuse and denial-of-service attacks.

**Implementation:** `ai-service/app.py`

```python
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["30 per minute"],
    storage_uri=f"redis://{REDIS_HOST}:{REDIS_PORT}"
)
```

- Default limit: **30 requests per minute** per IP address
- Rate limit state is stored in Redis for distributed tracking
- Exceeding the limit returns `429 Too Many Requests`
- Applied to all AI endpoints: `/api/ai/describe`, `/api/ai/recommend`, `/api/ai/generate-report`

---

### 5. SQL Injection Protection

The application uses JPA/Hibernate ORM with parameterized queries, which prevents SQL injection attacks.

**Implementation:** `backend/src/main/java/com/internship/tool/repository/OperationalRiskEventRepository.java`

All database queries use named parameters:
```java
@Query("SELECT e FROM OperationalRiskEvent e WHERE e.status = :status")
List<OperationalRiskEvent> findByStatus(@Param("status") String status);
```

- Raw SQL string concatenation is never used
- All user input is treated as data, never as SQL code
- Hibernate escapes all parameters automatically

---

### 6. Prompt Injection Handling

The AI service validates all user input before sending it to the LLM to prevent prompt injection attacks.

**Implementation:** `ai-service/services/validator.py`

Detected and blocked patterns include:
- `ignore previous instructions`
- `you are now`
- `disregard your system instructions`
- `act as a/an`
- `jailbreak`
- `<script>` tags

```python
INJECTION_PATTERNS = [
    r'ignore (previous|above|all) instructions',
    r'you are now',
    r'disregard (your|the) (system|instructions)',
    r'act as (a|an)',
    r'jailbreak',
    r'<\s*script',
]
```

- All text fields are sanitized before AI processing
- HTML tags are stripped from input
- Input is truncated to 2000 characters maximum
- Detected injection attempts return `400 Bad Request`

---

### 7. Audit Logging

Every action in the system is logged for accountability and forensic analysis.

**Implementation:** `backend/src/main/java/com/internship/tool/service/AuditService.java`

Logged information includes:
- Who performed the action (username)
- What action was performed (CREATE, UPDATE, DELETE)
- Which resource was affected (event ID)
- When it happened (timestamp)

---

### 8. Stateless Session Management

The application uses stateless JWT-based sessions — no server-side session storage.

```java
.sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
```

This prevents session fixation and session hijacking attacks.

---

### 9. CSRF Protection

CSRF is disabled because the application uses stateless JWT authentication (not cookies), making CSRF attacks not applicable.

---

### 10. Password Security

- Passwords are hashed using **BCrypt** with a strength factor of 10
- Plain text passwords are never stored or logged
- Password validation is enforced at registration

---

## Security Configuration

### Required Environment Variables

| Variable | Description | Requirement |
|----------|-------------|-------------|
| `JWT_SECRET` | JWT signing secret | Minimum 32 characters, use random hex |
| `DB_PASSWORD` | Database password | Strong password required |
| `ADMIN_PASSWORD` | Admin user password | Strong password required |
| `GROQ_API_KEY` | AI service API key | Keep secret, never commit |

### Generate a Secure JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Known Security Considerations

| Issue | Risk | Recommendation |
|-------|------|---------------|
| CORS allows all origins | Medium | Restrict to specific domains in production |
| No HTTPS in Docker setup | High | Add SSL certificate via nginx in production |
| No login rate limiting | Medium | Add brute force protection on `/auth/login` |
| Error messages exposed | Low | Set `include-message: never` in production |

---

## Reporting a Vulnerability

If you discover a security vulnerability in this project:

1. **Do not** open a public GitHub issue
2. Email the maintainer directly at the email on the GitHub profile
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work to resolve the issue promptly.

---

## Security Checklist for Deployment

Before deploying to production:

- [ ] Change all default passwords in `.env`
- [ ] Generate a strong JWT secret (minimum 64 characters)
- [ ] Enable HTTPS with a valid SSL certificate
- [ ] Restrict CORS to your specific domain
- [ ] Set `MAIL_ENABLED=false` if not using email
- [ ] Set `ENABLE_DEMO_SEED=false` to disable demo data
- [ ] Set error messages to `never` in `application.yml`
- [ ] Review and restrict firewall rules
- [ ] Enable database backups
- [ ] Monitor audit logs regularly

---

## Author

**Shrinidhi Totagi**
GitHub: [@ShrinidhiTotagi](https://github.com/ShrinidhiTotagi)
