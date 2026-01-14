-- Postgres schema for Software Support Ticket System
-- Core tables: users, categories, priorities, tickets, ticket_comments, ticket_assignments, attachments, audit_logs
-- Security features: MFA support, encrypted sensitive data, secure session management

-- NOTE: Adjust types/lengths and privileges per your environment.

CREATE TABLE IF NOT EXISTS users (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(16) NOT NULL CHECK (role IN ('client','agent','admin')),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  -- MFA fields
  mfa_enabled   BOOLEAN NOT NULL DEFAULT FALSE,
  mfa_secret    VARCHAR(255), -- TOTP secret (encrypted)
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ticket categories
CREATE TABLE IF NOT EXISTS categories (
  id   SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(128) NOT NULL UNIQUE,
  description TEXT
);

-- Ticket priorities
CREATE TABLE IF NOT EXISTS priorities (
  id   SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(32) NOT NULL UNIQUE,
  rank SMALLINT NOT NULL
);

-- Support tickets
CREATE TABLE IF NOT EXISTS tickets (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title         VARCHAR(255) NOT NULL,
  description   TEXT NOT NULL,
  status        VARCHAR(32) NOT NULL DEFAULT 'Open' CHECK (status IN ('Open','In Progress','Resolved','Closed')),
  created_by    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id   SMALLINT REFERENCES categories(id) ON DELETE SET NULL,
  priority_id   SMALLINT REFERENCES priorities(id) ON DELETE SET NULL,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ticket comments (internal and client-visible)
CREATE TABLE IF NOT EXISTS ticket_comments (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ticket_id   BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id     BIGINT REFERENCES users(id) ON DELETE SET NULL,
  message     TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ticket assignments (admin assigns to agents)
CREATE TABLE IF NOT EXISTS ticket_assignments (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ticket_id   BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  agent_id    BIGINT REFERENCES users(id) ON DELETE SET NULL,
  assigned_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  note        TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Attachments for tickets
CREATE TABLE IF NOT EXISTS attachments (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ticket_id   BIGINT REFERENCES tickets(id) ON DELETE CASCADE,
  file_key    VARCHAR(1024) NOT NULL, -- S3 key or local path
  filename    VARCHAR(512),
  content_type VARCHAR(255),
  size_bytes  BIGINT,
  uploaded_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Audit logs for security and compliance
CREATE TABLE IF NOT EXISTS audit_logs (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  entity_type  VARCHAR(64) NOT NULL,
  entity_id    BIGINT,
  action       VARCHAR(64) NOT NULL,
  performed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  ip_address   VARCHAR(45), -- IPv4 or IPv6
  user_agent   TEXT,
  payload      JSONB,
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Session management for secure authentication
CREATE TABLE IF NOT EXISTS user_sessions (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash   VARCHAR(255) NOT NULL UNIQUE, -- Hashed JWT token
  ip_address   VARCHAR(45),
  user_agent   TEXT,
  expires_at   TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes to optimize common queries
CREATE INDEX IF NOT EXISTS idx_tickets_created_by ON tickets(created_by);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category_id);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority_id);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_assignments_ticket_id ON ticket_assignments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_assignments_agent_id ON ticket_assignments(agent_id);
CREATE INDEX IF NOT EXISTS idx_attachments_ticket_id ON attachments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_by ON audit_logs(performed_by);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Trigger to update users.updated_at on row change
CREATE OR REPLACE FUNCTION touch_users_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_touch_users_updated_at') THEN
    CREATE TRIGGER trigger_touch_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE PROCEDURE touch_users_updated_at();
  END IF;
END;
$$;

-- Trigger to update tickets.updated_at on row change
CREATE OR REPLACE FUNCTION touch_tickets_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_touch_tickets_updated_at') THEN
    CREATE TRIGGER trigger_touch_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE PROCEDURE touch_tickets_updated_at();
  END IF;
END;
$$;

-- Seed categories for support tickets
INSERT INTO categories (name, description)
  SELECT * FROM (VALUES 
    ('General', 'General inquiries and support requests'),
    ('Bug Report', 'Software bugs, errors, and technical issues'),
    ('Feature Request', 'Suggestions for new features or improvements'),
    ('Technical Support', 'Technical assistance and troubleshooting'),
    ('Account Issue', 'Account-related problems (login, password, access)'),
    ('Billing', 'Billing, payment, and subscription issues'),
    ('Security', 'Security concerns and vulnerability reports')
  ) AS v(name, description)
  WHERE NOT EXISTS (SELECT 1 FROM categories);

-- Seed priorities
INSERT INTO priorities (name, rank)
  SELECT * FROM (VALUES
    ('Critical', 1),
    ('High', 2),
    ('Medium', 3),
    ('Low', 4)
  ) AS v(name, rank)
  WHERE NOT EXISTS (SELECT 1 FROM priorities);

-- End of schema
