# Software Support Ticket System

A secure, modern support ticketing platform built with React, Node.js, Express, and PostgreSQL. Clients can submit issues, admins assign tickets to agents, and agents resolve tickets with full audit history.

## Features

### Core Functionality
- **Ticket Lifecycle**: Open -> In Progress -> Resolved -> Closed
- **Role-Based Access**: Client, Agent, Admin
- **Admin Assignment**: Admins assign tickets to agents
- **Comments**: Public comments and internal notes (agent/admin)
- **Attachments**: Upload files for better issue context
- **Categories & Priorities**: Organize and triage tickets
- **Audit Logs**: Track all critical actions

### Security Features
- **JWT Authentication** with session revocation
- **MFA Support** using TOTP
- **Input Validation** and sanitization
- **Rate Limiting** and security headers
- **Audit Logging** for sensitive events

## Tech Stack

### Frontend
- React 18
- React Router
- Vite
- TailwindCSS + DaisyUI
- Axios

### Backend
- Node.js
- Express
- PostgreSQL
- Sequelize
- JWT
- bcrypt
- Multer

## Quick Start

### 1. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE ssts_db;
```

Run the schema:

```bash
psql -U postgres -d ssts_db -f db/migrations/schema.sql
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Update `.env`:

```env
DATABASE_URL=postgres://username:password@localhost:5432/ssts_db
PORT=4000
JWT_SECRET=your-secret-key-here
UPLOAD_DIR=./uploads
ENCRYPTION_KEY=your-64-hex-key
```

Start backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:4000/api
```

Start frontend:

```bash
npm run dev
```

## Roles

- **Client**: Create tickets and follow status
- **Agent**: Work assigned tickets, add internal notes
- **Admin**: Assign tickets, manage users, categories, and priorities

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register client
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Tickets
- `GET /api/tickets` - List tickets (role-aware)
- `GET /api/tickets/:id` - Ticket detail
- `POST /api/tickets` - Create ticket
- `PATCH /api/tickets/:id` - Update ticket
- `POST /api/tickets/:id/assign` - Assign ticket (admin only)

### Comments
- `POST /api/tickets/:id/comments` - Add comment

### Attachments
- `POST /api/attachments` - Upload attachment
- `GET /api/attachments/:id/download` - Download attachment

### Users (Admin)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PATCH /api/users/:id` - Update user
- `PATCH /api/users/:id/password` - Update password
- `GET /api/users/agents/list` - List agents

### Categories / Priorities
- `GET /api/categories`
- `POST /api/categories`
- `PATCH /api/categories/:id`
- `DELETE /api/categories/:id`
- `GET /api/priorities`
- `POST /api/priorities`
- `PATCH /api/priorities/:id`
- `DELETE /api/priorities/:id`

### Statistics / Audit
- `GET /api/statistics/dashboard`
- `GET /api/statistics/trends`
- `GET /api/audit`
- `GET /api/audit/ticket/:id`

## Project Structure

```
Software-Support-Ticket-System/
  backend/
    src/
      index.js
      models/
      routes/
      middleware/
  frontend/
    src/
      components/
      pages/
      services/
      main.jsx
  db/
    migrations/
      schema.sql
```

## Support

If you run into problems, create a ticket in this system or open an issue in the repository.
