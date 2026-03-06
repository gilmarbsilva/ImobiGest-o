-- Migração inicial do esquema ImobiGestão

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Corretores
CREATE TABLE IF NOT EXISTS brokers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  document TEXT,
  pix_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Proprietários
CREATE TABLE IF NOT EXISTS owners (
  id BIGSERIAL PRIMARY KEY,
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

-- Tabela de Inquilinos
CREATE TABLE IF NOT EXISTS tenants (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  document TEXT,
  asaas_id TEXT,
  history TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Imóveis
CREATE TABLE IF NOT EXISTS properties (
  id BIGSERIAL PRIMARY KEY,
  address TEXT NOT NULL,
  type TEXT,
  size DECIMAL,
  rooms INTEGER,
  bathrooms INTEGER DEFAULT 0,
  garage_spaces INTEGER DEFAULT 0,
  pets_allowed BOOLEAN DEFAULT FALSE,
  usage_type TEXT DEFAULT 'individual',
  owner_id BIGINT REFERENCES owners(id),
  document_links TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coproprietários (Proprietários Secundários)
CREATE TABLE IF NOT EXISTS property_owners (
  property_id BIGINT REFERENCES properties(id) ON DELETE CASCADE,
  owner_id BIGINT REFERENCES owners(id) ON DELETE CASCADE,
  share_percent DECIMAL DEFAULT 100,
  PRIMARY KEY (property_id, owner_id)
);

-- Tabela de Contratos
CREATE TABLE IF NOT EXISTS contracts (
  id BIGSERIAL PRIMARY KEY,
  property_id BIGINT REFERENCES properties(id),
  tenant_id BIGINT REFERENCES tenants(id),
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
  broker_id BIGINT REFERENCES brokers(id),
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

-- Tabela de Pagamentos
CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  contract_id BIGINT REFERENCES contracts(id) ON DELETE CASCADE,
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

-- Tabela de Vistorias
CREATE TABLE IF NOT EXISTS inspections (
  id BIGSERIAL PRIMARY KEY,
  contract_id BIGINT REFERENCES contracts(id) ON DELETE CASCADE,
  type TEXT, -- 'check-in' or 'check-out'
  date DATE,
  description TEXT,
  photos_link TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Manutenções
CREATE TABLE IF NOT EXISTS maintenances (
  id BIGSERIAL PRIMARY KEY,
  property_id BIGINT REFERENCES properties(id) ON DELETE CASCADE,
  description TEXT,
  request_date DATE,
  estimated_cost DECIMAL,
  actual_cost DECIMAL,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'completed', 'rejected'
  paid_by TEXT, -- 'owner', 'tenant', 'agency'
  photos_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS e permissões básicas para o ambiente de dev
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated full access" ON users FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access" ON brokers FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access" ON owners FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access" ON tenants FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access" ON properties FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access" ON property_owners FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access" ON contracts FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access" ON payments FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access" ON inspections FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access" ON maintenances FOR ALL TO authenticated USING (true);
