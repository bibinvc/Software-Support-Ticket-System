# Quick Setup Instructions

## Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in new terminal)
cd frontend
npm install
```

## Step 2: Set Up Environment Variables

Generate secrets:

```powershell
openssl rand -hex 32
```

Update `backend/.env`:

```env
DATABASE_URL=postgres://postgres:yourpassword@localhost:5432/ssts_db
JWT_SECRET=your-64-character-hex-string-here
ENCRYPTION_KEY=your-64-character-hex-string-here
```

## Step 3: Create Database

```sql
CREATE DATABASE ssts_db;
```

## Step 4: Run Database Migration

```bash
psql -U postgres -d ssts_db -f db/migrations/schema.sql
```

## Step 5: Start the Application

Terminal 1 - Backend:

```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:

```bash
cd frontend
npm run dev
```

## Step 6: Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000/api
- Health Check: http://localhost:4000/api/health

## Step 7: Test the Ticket Workflow

1. Register a client account at `/register`.
2. Create a ticket at `/tickets/new`.
3. Login as admin and assign the ticket to an agent.
4. Login as agent and update status to "In Progress" and then "Resolved".
5. Review audit logs in the Admin section.

## Troubleshooting

- Verify PostgreSQL is running.
- Check `DATABASE_URL` and secrets in `.env`.
- If ports are in use, change `PORT` and `VITE_API_URL`.
