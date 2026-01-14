# Security Requirements Report (Ticketing System)

## 1) Secure SDLC Coverage
Requirement: Security integrated across requirements, design, STRIDE modeling, secure coding, testing, and validation.

Evidence:
- `report/PROJECT_REPORT.md` (STRIDE threats and mitigations)
- `SECURITY_SETUP.md` (test scenarios)
- `README.md` (security features summary)

## 2) Secure Authentication and Authorization
Requirement: MFA, secure passwords, RBAC, secure sessions.

Evidence:
- `backend/src/routes/auth.js` (register/login, MFA)
- `backend/src/middleware/auth.js` (JWT verification, RBAC, session revocation)
- `backend/src/models/user.js` (bcrypt + MFA secret encryption)

## 3) Input Validation and Injection Protection
Requirement: Validate/sanitize input and prevent injections.

Evidence:
- `backend/src/middleware/validation.js` (sanitization + validation)
- Sequelize ORM parameterized queries across models

## 4) Secure Communication (HTTPS/TLS)
Requirement: TLS enforced or documented.

Evidence:
- `SECURITY_SETUP.md` includes self-signed TLS setup guidance.

## 5) Encryption and Secret Management
Requirement: Encrypt sensitive data and store secrets securely.

Evidence:
- AES-256-GCM encryption of MFA secrets in `backend/src/models/user.js`
- Secrets loaded from `.env` and documented in setup docs.

## 6) Secure Backend and API Endpoints
Requirement: Safe DB queries and secure API endpoints.

Evidence:
- RBAC enforced in `backend/src/routes/users.js`, `backend/src/routes/tickets.js`
- Rate limiting and security headers in `backend/src/middleware/security.js`
- Audit logs recorded in `backend/src/middleware/audit.js` and `backend/src/routes/audit.js`

## 7) Security Testing and Validation
Evidence:
- SQLi/XSS tests and RBAC checks in `SECURITY_SETUP.md`.

