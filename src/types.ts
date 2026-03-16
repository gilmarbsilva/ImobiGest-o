export interface Owner {
  id: number;
  name: string;
  email: string;
  phone: string;
  document: string;
}

export interface Tenant {
  id: number;
  name: string;
  email: string;
  phone: string;
  document: string;
  history?: string;
}

export interface Property {
  id: number;
  address: string;
  type: string;
  size: number;
  rooms: number;
  bathrooms: number;
  garage_spaces: number;
  pets_allowed: number;
  usage_type: 'individual' | 'shared';
  owner_id: number;
  owner_name?: string;
  secondary_owners?: { owner_id: number, name: string, share_percent: number }[];
  document_links?: string;
}

export interface Contract {
  id: number;
  property_id: number;
  tenant_id: number;
  start_date: string;
  end_date: string;
  rent_value: number;
  due_day: number;
  adjustment_index: string;
  fees: number;
  charges: number;
  extra_charges?: string;
  transfer_value: number;
  address?: string;
  tenant_name?: string;
  owner_name?: string;
  guarantee_type?: string;
  guarantee_value?: number;
  guarantee_payment_date?: string;
  guarantee_return_date?: string;
  water_installation?: string;
  electricity_installation?: string;
  gas_installation?: string;
  broker_id?: number;
  broker_name?: string;
  broker_commission_percent?: number;
  agency_commission_value?: number;
  document_links?: string;
  iptu_status?: 'pending' | 'paid' | 'n/a';
  condo_status?: 'pending' | 'paid' | 'n/a';
  last_adjustment_date?: string;
  next_adjustment_date?: string;
}

export interface Payment {
  id: number;
  contract_id: number;
  due_date: string;
  received_date: string | null;
  payment_method: string | null;
  amount_paid: number | null;
  transfer_date: string | null;
  transfer_amount: number | null;
  extra_payments?: string;
  status: 'pending' | 'paid' | 'overdue';
  tenant_name?: string;
  address?: string;
  commission_value?: number;
  broker_commission_value?: number;
  asaas_id?: string;
  asaas_status?: string;
  transfer_status?: 'pending' | 'done';
  broker_transfer_status?: 'pending' | 'done';
  broker_transfer_date?: string;
  broker_transfer_id?: string;
  debts_value?: number;
}

export interface Broker {
  id: number;
  name: string;
  email: string;
  phone: string;
  document: string;
  pix_key: string;
}

export interface Inspection {
  id: number;
  contract_id: number;
  type: 'check-in' | 'check-out';
  date: string;
  description: string;
  photos_link: string;
  status: 'pending' | 'completed';
  address?: string;
}

export interface Maintenance {
  id: number;
  property_id: number;
  description: string;
  request_date: string;
  estimated_cost: number;
  actual_cost: number;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  paid_by: 'owner' | 'tenant' | 'agency';
  photos_link: string;
  address?: string;
}
