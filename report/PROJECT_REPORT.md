# Project Report - Software Support Ticket System

## 1) System Description and Functional Requirements
This project implements a software support ticketing platform with three roles:
- Client: creates tickets and tracks progress.
- Agent: works assigned tickets and adds internal notes.
- Admin: assigns tickets and manages users, categories, and priorities.

Functional requirements mapped to the platform:
1) Authentication & Authorization: registration/login with RBAC.
   - Evidence: `backend/src/routes/auth.js`, `backend/src/middleware/auth.js`
2) Service listing: implemented as ticket listing and filtering.
   - Evidence: `backend/src/routes/tickets.js`, `frontend/src/pages/Tickets.jsx`
3) Order workflow: implemented as ticket lifecycle (Open -> In Progress -> Resolved -> Closed).
   - Evidence: `backend/src/routes/tickets.js`, `frontend/src/pages/Ticket.jsx`
4) Admin dashboard: manage users, categories, priorities, audit logs.
   - Evidence: `frontend/src/pages/AdminUsers.jsx`, `frontend/src/pages/AdminCategories.jsx`, `frontend/src/pages/AdminPriorities.jsx`, `frontend/src/pages/AdminAuditLogs.jsx`

## 2) Technologies Used
- Frontend: React 18, Vite, React Router, TailwindCSS, DaisyUI, Axios
- Backend: Node.js, Express, Sequelize, PostgreSQL
- Security: JWT, bcrypt, MFA (TOTP), rate limiting, audit logging

## 3) Architecture (Component View)
Client (React SPA)
  -> API Gateway (Express)
    -> Auth + RBAC (JWT + sessions)
    -> Ticket Service (tickets, comments, assignments)
    -> Admin Service (users, categories, priorities)
    -> Audit Logs
  -> Database (PostgreSQL)
  -> File Storage (local uploads or S3-compatible)

Key data flows:
- Client creates ticket -> stored in DB -> visible in ticket list.
- Admin assigns ticket -> assignment recorded -> agent gains access.
- Agent updates status/comments -> audit log recorded.

## 4) STRIDE Threat Modeling (one per category)
S - Spoofing:
  Threat: attacker steals a JWT to impersonate a user.
  Mitigation: JWT verification + session token hash + revocation in `backend/src/middleware/auth.js`.

T - Tampering:
  Threat: unauthorized ticket status modification.
  Mitigation: RBAC + ownership/assignment checks in `backend/src/routes/tickets.js`.

R - Repudiation:
  Threat: user denies making a critical change.
  Mitigation: audit logs in `backend/src/middleware/audit.js` and `backend/src/routes/audit.js`.

I - Information Disclosure:
  Threat: clients access internal agent notes.
  Mitigation: internal notes filtered for clients in `backend/src/routes/tickets.js`.

D - Denial of Service:
  Threat: brute force or API flooding.
  Mitigation: rate limiting in `backend/src/middleware/security.js`.

E - Elevation of Privilege:
  Threat: client tries to assign tickets.
  Mitigation: admin-only assignment endpoint in `backend/src/routes/tickets.js`.

## 5) Security Controls Implemented
- Authentication: JWT + session revocation, bcrypt hashing, MFA support.
- Authorization: `requireRole` middleware, ownership and assignment checks.
- Input validation: `backend/src/middleware/validation.js` with sanitization.
- Secure communication: TLS guidance in `SECURITY_SETUP.md`.
- Encryption: MFA secrets encrypted with AES-256-GCM.
- Secure backend: ORM parameterized queries, rate limiting, audit logging.

## 6) Testing and Validation
Suggested checks (see `SECURITY_SETUP.md`):
- SQLi tests against search endpoints.
- XSS tests in ticket/comments.
- RBAC tests for admin-only endpoints.
- Rate-limit checks for login attempts.

## 7) Admin and User Workflows
- Client: Register -> Create Ticket -> Comment -> Track Status
- Admin: Create Agent -> Assign Ticket -> Review Logs
- Agent: View Assigned Tickets -> Update Status -> Add Internal Notes

## 8) Deliverables Checklist
- Documentation: this report + `README.md` + `report/SECURE_SDLC_REPORT.md`
- Video: overview + STRIDE summary + security demonstrations
- Code: repository with backend, frontend, and schema

## 9) Screenshots to Include
- Login and dashboard view
- Ticket creation and ticket detail
- Admin assignment and audit logs
- Security tests (RBAC denial, SQLi attempt blocked)
