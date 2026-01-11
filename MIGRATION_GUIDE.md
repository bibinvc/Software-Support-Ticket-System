# Database Migration Guide

## Problem
If you see the error: `column "mfa_enabled" does not exist`, your database schema is outdated and needs to be migrated.

## Solution Options

### Option 1: Run Migration Script (Recommended for Existing Database)

If you already have a database with data:

```bash
cd backend
npm run migrate-db
```

This will:
- Add missing columns (mfa_enabled, mfa_secret, phone, address, bio, rating, total_orders, updated_at)
- Update role constraints (user/agent → customer/provider/admin)
- Preserve existing data

### Option 2: Run Full Schema Migration (For New Database)

If you're starting fresh or can recreate the database:

```bash
# Create database
psql -U postgres -c "CREATE DATABASE sharing_economy_db;"

# Run full schema
psql -U postgres -d sharing_economy_db -f db/migrations/schema.sql
```

### Option 3: Manual SQL Migration

If you prefer to run SQL manually:

```bash
psql -U postgres -d your_database_name -f db/migrations/add_mfa_columns.sql
```

## Quick Fix Steps

1. **Stop your backend server** (Ctrl+C)

2. **Run the migration:**
   ```bash
   cd backend
   npm run migrate-db
   ```

3. **Restart your backend:**
   ```bash
   npm run dev
   ```

4. **Try registering again** - it should work now!

## Verify Migration

After running the migration, verify the columns exist:

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('mfa_enabled', 'mfa_secret', 'phone', 'address', 'bio', 'rating', 'total_orders', 'updated_at');
```

You should see all 8 columns listed.

## Troubleshooting

### Error: "relation does not exist"
- Your database might not have the users table yet
- Run the full schema migration instead: `psql -U postgres -d your_db -f db/migrations/schema.sql`

### Error: "permission denied"
- Make sure you're using a user with CREATE/ALTER permissions
- Try connecting as postgres superuser: `psql -U postgres -d your_db`

### Error: "column already exists"
- Some columns might already exist - this is fine, the migration script handles this
- The migration will skip existing columns

## What Gets Migrated

The migration adds:
- ✅ `mfa_enabled` (BOOLEAN, default FALSE)
- ✅ `mfa_secret` (VARCHAR(255), nullable)
- ✅ `phone` (VARCHAR(50), nullable)
- ✅ `address` (TEXT, nullable)
- ✅ `bio` (TEXT, nullable)
- ✅ `rating` (DECIMAL(3,2), default 0.00)
- ✅ `total_orders` (INTEGER, default 0)
- ✅ `updated_at` (TIMESTAMP)

And updates:
- ✅ Role constraint: `user/agent/admin` → `customer/provider/admin`
- ✅ Existing users with role 'user' → 'customer'
- ✅ Existing users with role 'agent' → 'provider'

