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

The `.env` file has been created in the `backend` folder. **IMPORTANT**: You must update the secrets!

### Generate Secrets

Open PowerShell or Command Prompt and run:

```powershell
# Generate JWT Secret
openssl rand -hex 32

# Generate Encryption Key (for MFA)
openssl rand -hex 32
```

### Update backend/.env

Edit `backend/.env` and replace:
- `JWT_SECRET=CHANGE_THIS_GENERATE_WITH_openssl_rand_hex_32` with your generated JWT secret
- `ENCRYPTION_KEY=CHANGE_THIS_GENERATE_WITH_openssl_rand_hex_32` with your generated encryption key
- `DATABASE_URL` if your PostgreSQL credentials are different

Example:
```env
DATABASE_URL=postgres://postgres:yourpassword@localhost:5432/sharing_economy_db
JWT_SECRET=your-64-character-hex-string-here
ENCRYPTION_KEY=your-64-character-hex-string-here
```

## Step 3: Create Database

1. Start PostgreSQL service
2. Create the database:

```sql
CREATE DATABASE sharing_economy_db;
```

## Step 4: Run Database Migration

```bash
# Option 1: Using psql command
psql -U postgres -d sharing_economy_db -f db/migrations/schema.sql

# Option 2: Using the setup script (if available)
cd backend
npm run setup-db
```

## Step 5: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Step 6: Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000/api
- Health Check: http://localhost:4000/api/health

## Step 7: Test the Platform

### Create Accounts

1. Go to http://localhost:5173/register
2. Create a **Customer** account
3. Create a **Provider** account (use different email)

### As Provider

1. Login with provider account
2. Go to Dashboard → Create New Service
3. Fill in service details (title, description, price, category)
4. Save the service

### As Customer

1. Login with customer account
2. Browse services at http://localhost:5173/services
3. Click on a service to view details
4. Click "Place Order"
5. Fill in order details and submit

### Test Order Workflow

1. **Provider**: Go to Dashboard → Orders
2. **Provider**: Confirm the pending order
3. **Provider**: Update status to "In Progress"
4. **Provider**: Mark as "Completed"
5. **Customer**: Rate the provider

## Step 8: Test Security Controls

See `SECURITY_SETUP.md` for detailed security testing scenarios.

Quick tests:
1. **SQL Injection**: Try `' OR '1'='1` in search fields
2. **XSS**: Try `<script>alert(1)</script>` in input fields
3. **Authorization**: Try accessing `/api/users` as customer (should fail)
4. **Rate Limiting**: Send 10 rapid login requests (should be blocked)

## Troubleshooting

### Database Connection Error
- Check PostgreSQL is running
- Verify DATABASE_URL in `.env`
- Ensure database exists

### Port Already in Use
- Change PORT in `backend/.env`
- Update frontend API URL if needed

### Module Not Found
- Run `npm install` in both backend and frontend
- Delete `node_modules` and reinstall if needed

### CORS Errors
- Verify FRONTEND_URL in `backend/.env` matches frontend URL
- Check frontend is running on expected port

## Next Steps

1. Review `PROJECT_DOCUMENTATION.md` for complete documentation
2. Review `SECURITY_SETUP.md` for security details
3. Prepare video presentation demonstrating security features

