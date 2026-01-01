-- Postgres schema for Software Support Ticket System
-- Core tables: users, categories, priorities, tickets, ticket_assignments, ticket_comments, attachments, audit_logs, sla_policies

-- NOTE: Adjust types/lengths and privileges per your environment.

CREATE TABLE IF NOT EXISTS users (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(16) NOT NULL CHECK (role IN ('user','agent','admin')),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id   SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(128) NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE IF NOT EXISTS priorities (
  id   SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(32) NOT NULL UNIQUE,
  rank SMALLINT NOT NULL -- lower = lower urgency
);

CREATE TABLE IF NOT EXISTS sla_policies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(128) NOT NULL UNIQUE,
  time_to_first_response INTERVAL, -- e.g. '4 hours'
  time_to_resolution INTERVAL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tickets (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title         VARCHAR(255) NOT NULL,
  description   TEXT NOT NULL,
  category_id   SMALLINT REFERENCES categories(id) ON DELETE SET NULL,
  priority_id   SMALLINT REFERENCES priorities(id) ON DELETE SET NULL,
  sla_policy_id INT REFERENCES sla_policies(id) ON DELETE SET NULL,
  status        VARCHAR(32) NOT NULL DEFAULT 'Open' CHECK (status IN ('Open','In Progress','Resolved','Closed')),
  created_by    BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ticket_assignments (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ticket_id   BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  agent_id    BIGINT REFERENCES users(id) ON DELETE SET NULL,
  assigned_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  note        TEXT
);

-- If you prefer a single current assignment per ticket, enforce uniqueness:
CREATE UNIQUE INDEX IF NOT EXISTS ticket_current_assignment_idx ON ticket_assignments(ticket_id) WHERE agent_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS ticket_comments (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ticket_id   BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id     BIGINT REFERENCES users(id) ON DELETE SET NULL,
  message     TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS audit_logs (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  entity_type  VARCHAR(64) NOT NULL,
  entity_id    BIGINT,
  action       VARCHAR(64) NOT NULL,
  performed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  payload      JSONB,
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes to optimize common queries
CREATE INDEX IF NOT EXISTS idx_tickets_status_priority_created ON tickets(status, priority_id, created_at);
CREATE INDEX IF NOT EXISTS idx_tickets_created_by ON tickets(created_by);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_attachments_ticket_id ON attachments(ticket_id);

-- Partial index for active (non-closed) tickets
CREATE INDEX IF NOT EXISTS idx_tickets_active ON tickets(id) WHERE status != 'Closed';

-- Trigger to update tickets.updated_at on row change (optional)
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_touch_updated_at') THEN
    CREATE TRIGGER trigger_touch_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE PROCEDURE touch_updated_at();
  END IF;
END;
$$;

-- Seed priorities (example)
INSERT INTO priorities (name, rank)
  SELECT * FROM (VALUES ('Low', 10), ('Medium', 20), ('High', 30), ('Critical', 40)) AS v(name, rank)
  WHERE NOT EXISTS (SELECT 1 FROM priorities);

-- Seed a default category
INSERT INTO categories (name, description)
  VALUES ('General','General support requests')
  ON CONFLICT (name) DO NOTHING;


-- End of schema
