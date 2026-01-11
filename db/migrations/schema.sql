-- Postgres schema for Sharing Economy Platform
-- Core tables: users, categories, services, orders, order_messages, attachments, audit_logs
-- Security features: MFA support, encrypted sensitive data, secure session management

-- NOTE: Adjust types/lengths and privileges per your environment.

CREATE TABLE IF NOT EXISTS users (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(16) NOT NULL CHECK (role IN ('customer','provider','admin')),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  -- MFA fields
  mfa_enabled   BOOLEAN NOT NULL DEFAULT FALSE,
  mfa_secret    VARCHAR(255), -- TOTP secret (encrypted)
  -- Additional user fields for sharing economy
  phone         VARCHAR(50),
  address       TEXT,
  bio           TEXT,
  rating        DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
  total_orders  INTEGER DEFAULT 0,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Service categories
CREATE TABLE IF NOT EXISTS categories (
  id   SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(128) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(128) -- Icon identifier for UI
);

-- Services/Listings offered by providers
CREATE TABLE IF NOT EXISTS services (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title         VARCHAR(255) NOT NULL,
  description   TEXT NOT NULL,
  category_id   SMALLINT REFERENCES categories(id) ON DELETE SET NULL,
  provider_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- Pricing
  price         DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  currency      VARCHAR(3) NOT NULL DEFAULT 'USD',
  -- Service details
  duration_hours INTEGER, -- Estimated duration in hours
  location      VARCHAR(255), -- Service location
  is_available  BOOLEAN NOT NULL DEFAULT TRUE,
  -- Status
  status        VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','suspended')),
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Orders placed by customers
CREATE TABLE IF NOT EXISTS orders (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  service_id    BIGINT NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  customer_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  provider_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  -- Order details
  quantity      INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  total_price    DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
  currency      VARCHAR(3) NOT NULL DEFAULT 'USD',
  -- Order status workflow: pending -> confirmed -> in_progress -> completed -> cancelled
  status        VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','in_progress','completed','cancelled')),
  -- Order metadata
  special_instructions TEXT,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  completed_at  TIMESTAMP WITH TIME ZONE,
  cancelled_at  TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  -- Rating and review
  customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
  customer_review TEXT,
  provider_rating INTEGER CHECK (provider_rating >= 1 AND provider_rating <= 5),
  provider_review TEXT,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Messages/Communications between customer and provider for orders
CREATE TABLE IF NOT EXISTS order_messages (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id    BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id     BIGINT REFERENCES users(id) ON DELETE SET NULL,
  message     TEXT NOT NULL,
  is_system   BOOLEAN NOT NULL DEFAULT FALSE, -- System-generated messages (status updates)
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Attachments for services and orders
CREATE TABLE IF NOT EXISTS attachments (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  service_id  BIGINT REFERENCES services(id) ON DELETE CASCADE,
  order_id    BIGINT REFERENCES orders(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_services_provider_status ON services(provider_id, status);
CREATE INDEX IF NOT EXISTS idx_services_category_status ON services(category_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_status ON orders(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_provider_status ON orders(provider_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_service_id ON orders(service_id);
CREATE INDEX IF NOT EXISTS idx_order_messages_order_id ON order_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_attachments_service_id ON attachments(service_id);
CREATE INDEX IF NOT EXISTS idx_attachments_order_id ON attachments(order_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_by ON audit_logs(performed_by);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Partial index for active services
CREATE INDEX IF NOT EXISTS idx_services_active ON services(id) WHERE status = 'active' AND is_available = TRUE;

-- Partial index for active orders
CREATE INDEX IF NOT EXISTS idx_orders_active ON orders(id) WHERE status IN ('pending','confirmed','in_progress');

-- Trigger to update services.updated_at on row change
CREATE OR REPLACE FUNCTION touch_services_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_touch_services_updated_at') THEN
    CREATE TRIGGER trigger_touch_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE PROCEDURE touch_services_updated_at();
  END IF;
END;
$$;

-- Trigger to update orders.updated_at on row change
CREATE OR REPLACE FUNCTION touch_orders_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_touch_orders_updated_at') THEN
    CREATE TRIGGER trigger_touch_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE PROCEDURE touch_orders_updated_at();
  END IF;
END;
$$;

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

-- Seed categories for sharing economy platform
INSERT INTO categories (name, description, icon)
  SELECT * FROM (VALUES 
    ('Cleaning', 'Home and office cleaning services', 'cleaning'),
    ('Tutoring', 'Educational and tutoring services', 'tutoring'),
    ('Repair', 'Repair and maintenance services', 'repair'),
    ('Delivery', 'Delivery and courier services', 'delivery'),
    ('Photography', 'Photography and videography services', 'photography'),
    ('Cooking', 'Cooking and catering services', 'cooking'),
    ('Design', 'Graphic design and creative services', 'design'),
    ('Fitness', 'Personal training and fitness services', 'fitness'),
    ('Other', 'Other services', 'other')
  ) AS v(name, description, icon)
  WHERE NOT EXISTS (SELECT 1 FROM categories);

-- End of schema
