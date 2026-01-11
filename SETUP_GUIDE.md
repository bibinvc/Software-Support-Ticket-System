# Setup Guide - Sharing Economy Platform

## Quick Start

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Database Setup

1. Start PostgreSQL service
2. Create database:
   ```sql
   CREATE DATABASE sharing_economy_db;
   ```
3. Run schema migration:
   ```bash
   cd backend
   psql -U postgres -d sharing_economy_db -f ../db/migrations/schema.sql
   ```
   Or use the setup script:
   ```bash
   npm run setup-db
   ```

### 3. Environment Configuration

1. Copy environment example:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Edit `backend/.env` and set:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: Generate with `openssl rand -hex 32`
   - `ENCRYPTION_KEY`: Generate with `openssl rand -hex 32`
   - `FRONTEND_URL`: Usually `http://localhost:5173`

3. Frontend environment (optional):
   ```bash
   # frontend/.env (if needed)
   VITE_API_URL=http://localhost:4000/api
   ```

### 4. Run the Application

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

### 5. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000/api
- Health Check: http://localhost:4000/api/health

## Default Test Accounts

After setup, create accounts through the registration page:
- Customer account: Register with role "Customer"
- Provider account: Register with role "Provider"
- Admin account: Create via database or API (role: 'admin')

## Key Features to Test

1. **Registration**: Create customer and provider accounts
2. **Service Creation**: As provider, create a service listing
3. **Service Browsing**: Browse services as customer
4. **Order Placement**: Place an order as customer
5. **Order Management**: Provider confirms and completes order
6. **MFA Setup**: Enable MFA in user profile
7. **Admin Dashboard**: Access admin features (if admin account)

## Security Testing

See `SECURITY_SETUP.md` for security testing scenarios including:
- SQL Injection tests
- XSS tests
- Authorization tests
- Rate limiting tests

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database exists and user has permissions

### Port Already in Use
- Change PORT in backend/.env
- Update frontend API URL if backend port changes

### Module Not Found
- Run `npm install` in both backend and frontend
- Check that all dependencies in package.json are installed

### CORS Errors
- Verify FRONTEND_URL in backend/.env matches frontend URL
- Check that frontend is running on the expected port

## Next Steps

1. Review `PROJECT_DOCUMENTATION.md` for complete system documentation
2. Review `SECURITY_SETUP.md` for security configuration
3. Test all security controls as described in documentation
4. Prepare video presentation demonstrating security features

