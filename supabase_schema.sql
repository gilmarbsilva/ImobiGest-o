-- Supabase Migration Script (PostgreSQL)

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brokers Table
CREATE TABLE IF NOT EXISTS brokers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  document TEXT,
  pix_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Owners Table
CREATE TABLE IF NOT EXISTS owners (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  document TEXT,
  bank_code TEXT,
  bank_agency TEXT,
  bank_account TEXT,
  bank_account_digit TEXT,
  bank_account_type TEXT,
  pix_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenants Table
CREATE TABLE IF NOT EXISTS tenants (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  document TEXT,
  asaas_id TEXT,
  history TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Properties Table
CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  address TEXT NOT NULL,
  type TEXT,
  size DECIMAL,
  rooms INTEGER,
  bathrooms INTEGER DEFAULT 0,
  garage_spaces INTEGER DEFAULT 0,
  pets_allowed BOOLEAN DEFAULT FALSE,
  usage_type TEXT DEFAULT 'individual',
  owner_id INTEGER REFERENCES owners(id),
  document_links TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property Owners (Secondary Owners)
CREATE TABLE IF NOT EXISTS property_owners (
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  owner_id INTEGER REFERENCES owners(id) ON DELETE CASCADE,
  share_percent DECIMAL DEFAULT 100,
  PRIMARY KEY (property_id, owner_id)
);

-- Contracts Table
CREATE TABLE IF NOT EXISTS contracts (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id),
  tenant_id INTEGER REFERENCES tenants(id),
  start_date DATE,
  end_date DATE,
  rent_value DECIMAL,
  due_day INTEGER,
  fees DECIMAL DEFAULT 0,
  charges DECIMAL DEFAULT 0,
  extra_charges TEXT,
  transfer_value DECIMAL,
  adjustment_index TEXT,
  guarantee_type TEXT,
  guarantee_value DECIMAL DEFAULT 0,
  guarantee_payment_date DATE,
  guarantee_return_date DATE,
  water_installation TEXT,
  electricity_installation TEXT,
  gas_installation TEXT,
  broker_id INTEGER REFERENCES brokers(id),
  broker_commission_percent DECIMAL DEFAULT 0,
  agency_commission_value DECIMAL DEFAULT 0,
  document_links TEXT,
  iptu_status TEXT DEFAULT 'pending',
  condo_status TEXT DEFAULT 'pending',
  last_adjustment_date DATE,
  next_adjustment_date DATE,
  admin_tax DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  contract_id INTEGER REFERENCES contracts(id) ON DELETE CASCADE,
  due_date DATE,
  received_date DATE,
  payment_method TEXT,
  amount_paid DECIMAL,
  transfer_date DATE,
  transfer_amount DECIMAL,
  status TEXT DEFAULT 'pending',
  asaas_id TEXT,
  asaas_status TEXT,
  commission_value DECIMAL DEFAULT 0,
  transfer_status TEXT DEFAULT 'pending',
  extra_payments TEXT,
  broker_commission_value DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inspections Table
CREATE TABLE IF NOT EXISTS inspections (
  id SERIAL PRIMARY KEY,
  contract_id INTEGER REFERENCES contracts(id) ON DELETE CASCADE,
  type TEXT, -- 'check-in' or 'check-out'
  date DATE,
  description TEXT,
  photos_link TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maintenances Table
CREATE TABLE IF NOT EXISTS maintenances (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  description TEXT,
  request_date DATE,
  estimated_cost DECIMAL,
  actual_cost DECIMAL,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'completed', 'rejected'
  paid_by TEXT, -- 'owner', 'tenant', 'agency'
  photos_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Default Admin User
INSERT INTO users (username, name, password) 
VALUES ('admin', 'Administrador', 'admin123')
ON CONFLICT (username) DO NOTHING;

-- RLS Policies (Optional - Enable if you want to use ANON_KEY on server)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all" ON users FOR ALL USING (true) WITH CHECK (true);
-- Repetir para todas as tabelas se necessário...
