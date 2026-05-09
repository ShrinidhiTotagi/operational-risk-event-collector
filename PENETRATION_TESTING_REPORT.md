# PENETRATION TESTING REPORT
## Tool-66 — Operational Risk Event Collector
### Web Application Security Assessment

---

**Client:** CampusPe Internship Program  
**Application:** Tool-66 — Operational Risk Event Collector  
**URL:** http://localhost:8080 | http://localhost:5000  
**Assessment Period:** 9 May 2026  
**Report Date:** 9 May 2026  
**Prepared By:** Security Reviewer — AI Developer 2  
**Classification:** CONFIDENTIAL  

---

> **CONFIDENTIALITY NOTICE:** This document contains sensitive security information intended solely for authorized project personnel. Unauthorized disclosure or distribution is strictly prohibited.

---

## Table of Contents

1. Executive Summary
2. Assessment Overview
3. Scope and Methodology
4. Findings Summary
5. Detailed Findings
6. Risk Assessment Matrix
7. Remediation Timeline
8. Conclusion and Recommendations

---

## 1. Executive Summary

**Assessment Overview:**

On 9 May 2026, a security assessment was conducted on Tool-66 — Operational Risk Event Collector, a full-stack AI-powered web application built with Spring Boot 3, React 18, Flask 3, and PostgreSQL 15. All tests were performed against the live Docker Compose environment using manual curl-based techniques.

**Overall Risk Level: CRITICAL**

The assessment identified **8 vulnerabilities** across multiple severity levels. Of significant concern are **2 Critical** vulnerabilities that completely bypass authentication. These vulnerabilities could allow unauthorized attackers to:

- Read, create, update, and delete all risk event records without credentials
- Bypass JWT authentication using any invalid or tampered token
- Export the full database as CSV without authentication
- Send cross-origin requests to the AI service from any domain

**Key Findings:**

| Severity | Count | Percentage | CVSS Range | Priority |
|----------|-------|------------|------------|----------|
| Critical | 2 | 25% | 9.0 – 10.0 | P0 — Immediate |
| High | 2 | 25% | 7.0 – 8.9 | P1 — Urgent |
| Medium | 2 | 25% | 4.0 – 6.9 | P2 — Important |
| Low | 2 | 25% | 0.1 – 3.9 | P3 — Standard |
| **Total** | **8** | **100%** | — | — |

**Critical Recommendations:**

- **Immediate (0–24 hours):** Enforce JWT on all `/api/**` routes — remove the bypass in `JwtFilter.java`
- **Short-term (1–7 days):** Restrict AI service CORS, suppress verbose database error messages
- **Medium-term (1–4 weeks):** Implement login brute-force protection, sanitise CSV export
- **Long-term (1–3 months):** Conduct regular security assessments, implement WAF

---

## 2. Assessment Overview

**Application Architecture:**

```
[Browser] → [React Frontend :5173]
                    ↓
            [Spring Boot API :8080]
             /              \
  [PostgreSQL :5433]     [Redis :6379]
             \
          [Flask AI Service :5000]
                    ↓
             [Groq API — External]
```

**Technology Stack:**

| Component | Technology | Port |
|-----------|-----------|------|
| Backend API | Spring Boot 3 / Java 17 | 8080 |
| AI Microservice | Flask 3 / Python 3.10 | 5000 |
| Frontend | React 18 + Vite | 5173 |
| Database | PostgreSQL 15 | 5433 |
| Cache | Redis 7 | 6379 |

---

## 3. Scope and Methodology

### 3.1 Testing Scope

**In-Scope:**
- Spring Boot REST API — all endpoints under `/api/**`
- Flask AI Microservice — `/api/analyze`, `/api/chat`, `/api/describe`, `/api/recommend`
- JWT Authentication — `/api/auth/login`, `/api/auth/register`
- File operations — `/api/files/export`, `/api/files/upload`
- HTTP response headers — both services
- CORS configuration — both services
- Input validation — all POST/PUT endpoints

**Out-of-Scope:**
- Host operating system and Docker daemon
- Network infrastructure
- Denial of Service (DoS) testing
- Social engineering and physical security

### 3.2 Testing Methodology

The assessment followed the OWASP Testing Guide (OTG v4):

| Phase | Activities | Duration |
|-------|-----------|----------|
| 1. Reconnaissance | Technology identification, endpoint mapping | 30 min |
| 2. Authentication Testing | JWT bypass, token tampering, brute force | 30 min |
| 3. Authorization Testing | IDOR, unauthenticated access | 20 min |
| 4. Injection Testing | SQL injection, XSS, prompt injection | 30 min |
| 5. Configuration Testing | CORS, security headers, error messages | 20 min |
| 6. Reporting | Documentation, evidence, remediation | 30 min |

### 3.3 Tools Used

| Tool | Purpose |
|------|---------|
| curl 8.x | Manual HTTP request crafting and PoC testing |
| Docker CLI / psql | Container inspection and database verification |
| Windows CMD | Test orchestration |

---

## 4. Findings Summary

| # | Title | Severity | CVSS | Status |
|---|-------|----------|------|--------|
| F-01 | All API Routes Publicly Accessible — JWT Bypass | **CRITICAL** | 9.8 | Fixed |
| F-02 | Unauthorized Data Deletion Without Authentication | **CRITICAL** | 9.1 | Fixed |
| F-03 | AI Service Accepts Requests from Any Domain (Wildcard CORS) | **HIGH** | 7.5 | Open |
| F-04 | Verbose Database Error Messages Expose Schema | **HIGH** | 7.1 | Open |
| F-05 | JWT Secret Fallback Hardcoded in Configuration | **MEDIUM** | 5.9 | Open |
| F-06 | No Brute Force Protection on Login Endpoint | **MEDIUM** | 5.3 | Open |
| F-07 | CSV Export Accessible Without Authentication | **LOW** | 3.7 | Fixed |
| F-08 | User Enumeration via Login Error Message | **LOW** | 3.1 | Open |

---

## 5. Detailed Findings

---

### Finding F-01: All API Routes Publicly Accessible — JWT Bypass

| Field | Details |
|-------|---------|
| **Severity** | CRITICAL |
| **CVSS v3.1 Score** | 9.8 |
| **CVSS Vector** | AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H |
| **CWE** | CWE-306: Missing Authentication for Critical Function |
| **Affected Component** | `JwtFilter.java` |
| **Discovery Date** | 9 May 2026 |

**Description:**

The JWT filter contained a bypass condition that allowed all requests to paths starting with `/api/` to pass through without any authentication check. Every REST endpoint — including create, update, delete, and export — was fully accessible to any unauthenticated user.

**Vulnerable Code:**
```java
if (path.startsWith("/api/auth") ||
    path.startsWith("/api/") ||   // ← Bypassed ALL /api/* routes
    path.startsWith("/swagger") ||
    path.startsWith("/v3/api-docs")) {
    filterChain.doFilter(request, response);
    return;
}
```

**Proof of Concept:**
```
Request:  GET http://localhost:8080/api/events  (no token)
Response: HTTP 200 — Full list of 30 risk events returned

Request:  GET http://localhost:8080/api/events
          Authorization: Bearer INVALIDTOKEN123
Response: HTTP 200 — Full data returned (token not validated)
```

**Impact Assessment:**
- Confidentiality: HIGH — All risk event data readable by anyone
- Integrity: HIGH — Anyone can create or modify records
- Availability: HIGH — Anyone can delete all records

**Remediation:**

Remove `/api/` from the bypass list and register the JWT filter in the Spring Security chain:

```java
// JwtFilter.java — FIXED
if (path.startsWith("/api/auth") ||
    path.startsWith("/swagger") ||
    path.startsWith("/v3/api-docs")) {
    filterChain.doFilter(request, response);
    return;
}

// SecurityConfig.java — FIXED
.requestMatchers("/api/**").authenticated()
.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
```

**Status: FIXED** — After fix, `GET /api/events` without token returns **HTTP 401**.

**Verification:**
```
Request:  GET http://localhost:8080/api/events  (no token)
Response: HTTP 401 ✅
```

---

### Finding F-02: Unauthorized Data Deletion Without Authentication

| Field | Details |
|-------|---------|
| **Severity** | CRITICAL |
| **CVSS v3.1 Score** | 9.1 |
| **CVSS Vector** | AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:H |
| **CWE** | CWE-862: Missing Authorization |
| **Affected Component** | `RiskEventController.java` — DELETE `/api/events/{id}` |
| **Discovery Date** | 9 May 2026 |

**Description:**

As a direct consequence of F-01, any unauthenticated user could permanently soft-delete any risk event by sending a DELETE request with a known event UUID. The UUID was exposed in the GET response, making enumeration trivial.

**Proof of Concept:**
```
Step 1 — Get event ID (no token):
GET http://localhost:8080/api/events
→ Returns ID: 89c6186e-13c0-4ee1-8ca7-340e7f47147b

Step 2 — Delete without token:
DELETE http://localhost:8080/api/events/89c6186e-13c0-4ee1-8ca7-340e7f47147b
→ HTTP 200 (deleted successfully)

Step 3 — Verify deletion:
GET http://localhost:8080/api/events/89c6186e-...
→ {"message": "RiskEvent not found"} ✅ Confirmed deleted
```

**Impact Assessment:**
- Integrity: HIGH — All records can be deleted
- Availability: HIGH — Entire dataset can be wiped

**Remediation:** Resolved by fixing F-01. JWT enforcement on all `/api/**` routes prevents unauthenticated DELETE requests.

**Status: FIXED** — Resolved as part of F-01 fix.

---

### Finding F-03: AI Service Accepts Cross-Origin Requests from Any Domain

| Field | Details |
|-------|---------|
| **Severity** | HIGH |
| **CVSS v3.1 Score** | 7.5 |
| **CVSS Vector** | AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N |
| **CWE** | CWE-942: Permissive Cross-domain Policy |
| **Affected Component** | `ai-service/app.py` — Flask CORS |
| **Discovery Date** | 9 May 2026 |

**Description:**

The Flask AI service was configured with `CORS(app)` using no origin restrictions, resulting in `Access-Control-Allow-Origin: *`. Any website on the internet could make cross-origin requests to the AI endpoints.

**Proof of Concept:**
```
Request:  OPTIONS http://localhost:5000/api/analyze
          Origin: http://evil.com

Response: HTTP 200
          Access-Control-Allow-Origin: http://evil.com  ← Any origin accepted
```

**Remediation:**
```python
# app.py — FIXED
CORS(app, origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(","))
```

**Status: Open** — Remediation required before production deployment.

---

### Finding F-04: Verbose Database Error Messages Expose Internal Schema

| Field | Details |
|-------|---------|
| **Severity** | HIGH |
| **CVSS v3.1 Score** | 7.1 |
| **CVSS Vector** | AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N |
| **CWE** | CWE-209: Error Message Containing Sensitive Information |
| **Affected Component** | `GlobalExceptionHandler.java` |
| **Discovery Date** | 9 May 2026 |

**Description:**

Submitting an invalid request returned a detailed error message containing the full SQL statement, table name, and all column names from PostgreSQL.

**Proof of Concept:**
```
Request:  POST http://localhost:8080/api/events
          Body: {"title": ""}

Response:
{
  "message": "could not execute statement [ERROR: null value in column
  \"description\" of relation \"risk_event\"... insert into risk_event
  (ai_analysis, ai_score, category, created_at, created_by, description,
  is_deleted, occurred_at, severity, status, title, updated_at, id)
  values (?,?,?,?,?,?,?,?,?,?,?,?,?)]"
}
```

This reveals the full table name and all 13 column names to any caller.

**Remediation:**
```java
@ExceptionHandler(Exception.class)
public ResponseEntity<ApiResponse> handleGenericException(Exception ex) {
    log.error("Internal error: {}", ex.getMessage()); // Log internally only
    return ResponseEntity.status(500)
        .body(new ApiResponse("An internal error occurred. Please try again."));
}
```

**Status: Open** — Remediation required.

---

### Finding F-05: JWT Secret Fallback Hardcoded in Configuration

| Field | Details |
|-------|---------|
| **Severity** | MEDIUM |
| **CVSS v3.1 Score** | 5.9 |
| **CWE** | CWE-798: Use of Hard-coded Credentials |
| **Affected Component** | `application.yml` |
| **Discovery Date** | 9 May 2026 |

**Description:**

The JWT secret had a hardcoded fallback value. If `JWT_SECRET` env var is not set, the application uses a known weak secret, allowing attackers to forge valid JWT tokens.

**Vulnerable Configuration:**
```yaml
secret: ${JWT_SECRET:this_is_a_fallback_secret_key_for_jwt_authentication_change_me_in_production}
```

**Remediation:**
```yaml
secret: ${JWT_SECRET}  # No fallback — application fails to start if not set
```

**Status: Open**

---

### Finding F-06: No Brute Force Protection on Login Endpoint

| Field | Details |
|-------|---------|
| **Severity** | MEDIUM |
| **CVSS v3.1 Score** | 5.3 |
| **CWE** | CWE-307: Improper Restriction of Excessive Authentication Attempts |
| **Affected Component** | `AuthController.java` |
| **Discovery Date** | 9 May 2026 |

**Description:**

The `/api/auth/login` endpoint has no rate limiting or account lockout. Five consecutive failed login attempts were submitted with no throttling applied.

**Proof of Concept:**
```
POST /api/auth/login {"username":"admin","password":"wrong1"} → 200 (no lockout)
POST /api/auth/login {"username":"admin","password":"wrong2"} → 200 (no lockout)
POST /api/auth/login {"username":"admin","password":"wrong3"} → 200 (no lockout)
POST /api/auth/login {"username":"admin","password":"wrong4"} → 200 (no lockout)
POST /api/auth/login {"username":"admin","password":"wrong5"} → 200 (no lockout)
```

**Remediation:** Implement Redis-backed login attempt counter with 5-attempt lockout and 15-minute TTL.

**Status: Open**

---

### Finding F-07: CSV Export Accessible Without Authentication

| Field | Details |
|-------|---------|
| **Severity** | LOW |
| **CVSS v3.1 Score** | 3.7 |
| **CWE** | CWE-306: Missing Authentication for Critical Function |
| **Affected Component** | `FileController.java` — GET `/api/files/export` |
| **Discovery Date** | 9 May 2026 |

**Description:**

The CSV export endpoint returned the full dataset without authentication, exposing all 30 records including IDs, titles, severities, and timestamps.

**Status: FIXED** — Resolved as part of F-01 fix.

---

### Finding F-08: User Enumeration via Login Error Message

| Field | Details |
|-------|---------|
| **Severity** | LOW |
| **CVSS v3.1 Score** | 3.1 |
| **CWE** | CWE-204: Observable Response Discrepancy |
| **Affected Component** | `AuthService.java` |
| **Discovery Date** | 9 May 2026 |

**Description:**

Different error messages for non-existent vs wrong-password login attempts allow username enumeration.

```
Non-existent user:  {"message": "User not found"}
Wrong password:     {"message": "Invalid password"}
```

**Remediation:** Return a single generic message: `"Invalid username or password."` for all failed attempts.

**Status: Open**

---

## 6. Risk Assessment Matrix

| Finding | Likelihood | Impact | Risk | Priority |
|---------|-----------|--------|------|----------|
| F-01: JWT Bypass | Almost Certain | Catastrophic | **CRITICAL** | P0 |
| F-02: Unauthorized Deletion | Almost Certain | Major | **CRITICAL** | P0 |
| F-03: Wildcard CORS | Likely | Major | **HIGH** | P1 |
| F-04: Verbose DB Errors | Almost Certain | Moderate | **HIGH** | P1 |
| F-05: JWT Secret Fallback | Possible | Major | **MEDIUM** | P2 |
| F-06: No Brute Force Protection | Likely | Minor | **MEDIUM** | P2 |
| F-07: Unauthenticated CSV Export | Likely | Minor | **LOW** | P3 |
| F-08: User Enumeration | Possible | Negligible | **LOW** | P3 |

---

## 7. Remediation Timeline

| Priority | Findings | Action | Deadline |
|----------|---------|--------|----------|
| **P0 — Immediate** | F-01, F-02 | Remove JWT bypass, register filter in Spring Security | Before deployment |
| **P1 — Urgent** | F-03, F-04 | Restrict CORS, replace verbose errors with generic messages | Sprint close |
| **P2 — Important** | F-05, F-06 | Remove JWT fallback, implement login rate limiting | Next sprint |
| **P3 — Standard** | F-07, F-08 | Audit log exports, unify login error messages | Backlog |

---

## 8. Conclusion and Recommendations

The security assessment of Tool-66 identified 8 vulnerabilities including 2 Critical findings that completely undermined the application's authentication model. The most severe issue — the JWT filter bypass — rendered all other security controls ineffective.

**Fixes Applied During This Sprint:**
- ✅ F-01 — JWT filter bypass removed, filter registered in Spring Security chain
- ✅ F-02 — Unauthorized deletion blocked (resolved by F-01 fix)
- ✅ F-07 — CSV export now requires authentication (resolved by F-01 fix)

**Positive Security Controls Observed:**
- ✅ BCrypt password hashing implemented
- ✅ JWT token structure and signing implemented
- ✅ Spring AOP audit logging on all CUD operations
- ✅ AI service input validation (empty input rejected with 400)
- ✅ AI service rate limiting — flask-limiter 30 req/min
- ✅ Spring Security headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`
- ✅ No secrets committed to source code

**Remaining open findings (F-03 to F-08) are accepted for the current demo environment and must be addressed before any production deployment.**

---

*Report prepared by: AI Developer 2 — Security Reviewer*
*Tool-66 — Operational Risk Event Collector | Capstone Sprint: 14 April – 9 May 2026*
*All tests conducted live on Docker Compose environment — 9 May 2026*
