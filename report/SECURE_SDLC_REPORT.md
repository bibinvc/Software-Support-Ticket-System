# Secure SDLC Report (Ticketing System)

## 1) Objective
Build a secure software support ticketing system and demonstrate Secure SDLC practices from requirements through implementation and validation.

## 2) Functional Requirements and Evidence

### 2.1 Authentication & Authorization (Registration, Login, RBAC)
Requirement: User registration and login with role-based access control.

Evidence:
- `backend/src/routes/auth.js` (register/login/MFA)
- `backend/src/middleware/auth.js` (JWT verification + RBAC)
- `frontend/src/pages/Login.jsx`, `frontend/src/pages/Register.jsx`

### 2.2 Service Listing (Ticket Listing)
Requirement: Display available services/goods. For this ticketing platform, the equivalent listing is ticket discovery and filtering.

Evidence:
- `backend/src/routes/tickets.js` (list tickets with filters)
- `frontend/src/pages/Tickets.jsx` (ticket list UI)

### 2.3 Order Workflow (Ticket Lifecycle)
Requirement: Order workflow with validation and status updates. For ticketing, the business workflow is the ticket lifecycle:
Open -> In Progress -> Resolved -> Closed.

Evidence:
- `backend/src/routes/tickets.js` (status updates, validation)
- `frontend/src/pages/Ticket.jsx` (status updates and comments)

### 2.4 Administrator Dashboard
Requirement: Admin manages platform data and users.

Evidence:
- `backend/src/routes/users.js` (admin-only user management)
- `backend/src/routes/categories.js`, `backend/src/routes/priorities.js`
- `frontend/src/pages/AdminUsers.jsx`, `frontend/src/pages/AdminCategories.jsx`, `frontend/src/pages/AdminPriorities.jsx`
- `frontend/src/pages/Dashboard.jsx` (admin stats + lists)

## 3) Secure SDLC Controls Applied
- Requirements: Security and RBAC defined in README and reports.
- Design: STRIDE threat analysis documented in the project report.
- Implementation: RBAC, MFA, audit logs, validation, and rate limiting.
- Testing: Security test scenarios documented in `SECURITY_SETUP.md`.
- Deployment: Secrets and TLS guidance documented.

## 4) Folder Structure Snapshot
```
Software-Support-Ticket-System/
  backend/
    src/
      middleware/
      models/
      routes/
  frontend/
    src/
      pages/
      components/
  db/
    migrations/
```

## 5) Evidence Artifacts
- API routes: `backend/src/routes/*`
- Security middleware: `backend/src/middleware/*`
- Ticket UI: `frontend/src/pages/Tickets.jsx`, `frontend/src/pages/Ticket.jsx`

