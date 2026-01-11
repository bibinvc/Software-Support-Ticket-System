-- Migration: Add MFA and additional user fields to existing users table
-- Run this if you have an existing database that needs to be updated

-- Add MFA columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='mfa_enabled') THEN
        ALTER TABLE users ADD COLUMN mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='mfa_secret') THEN
        ALTER TABLE users ADD COLUMN mfa_secret VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='phone') THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='address') THEN
        ALTER TABLE users ADD COLUMN address TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='bio') THEN
        ALTER TABLE users ADD COLUMN bio TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='rating') THEN
        ALTER TABLE users ADD COLUMN rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='total_orders') THEN
        ALTER TABLE users ADD COLUMN total_orders INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='updated_at') THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
    END IF;
END $$;

-- Update existing users with old roles to new roles FIRST
UPDATE users SET role = 'customer' WHERE role = 'user';
UPDATE users SET role = 'provider' WHERE role = 'agent';

-- Update role constraint if needed
DO $$
BEGIN
    -- Drop old constraint if it exists
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'users_role_check' 
               AND table_name = 'users') THEN
        ALTER TABLE users DROP CONSTRAINT users_role_check;
    END IF;
    
    -- Add new constraint
    ALTER TABLE users ADD CONSTRAINT users_role_check 
        CHECK (role IN ('customer','provider','admin'));
END $$;

