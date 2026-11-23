import { z } from 'zod';
import type { Owner, Tenant, Property, Contract, Payment, Broker, Inspection, Maintenance } from './types';

// Zod schemas for validation
export const ownerSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  document: z.string().min(1, 'Documento é obrigatório'),
  bank_code: z.string().optional(),
  bank_name: z.string().optional(),
  bank_agency: z.string().optional(),
  bank_account: z.string().optional(),
  bank_account_type: z.string().optional(),
  pix_key: z.string().optional(),
  admin_tax: z.number().optional(),
}) satisfies z.ZodType<Owner>;

export const tenantSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  document: z.string().min(1, 'Documento é obrigatório'),
  history: z.string().optional(),
  asaas_id: z.string().optional(),
}) satisfies z.ZodType<Tenant>;

export const propertySchema = z.object({
  id: z.number(),
  identification: z.string().optional(),
  address: z.string().min(1, 'Endereço é obrigatório'),
  address_complement: z.string().optional(),
  type: z.string().min(1, 'Tipo é obrigatório'),
  size: z.number().min(1, 'Tamanho deve ser maior que 0'),
  rooms: z.number().min(0),
  bathrooms: z.number().min(0),
  garage_spaces: z.number().min(0),
  pets_allowed: z.number().min(0).max(1),
  usage_type: z.enum(['individual', 'shared']),
  owner_id: z.number().min(1, 'Proprietário é obrigatório'),
  owner_name: z.string().optional(),
  secondary_owners: z.array(z.object({
    owner_id: z.number(),
    name: z.string(),
    share_percent: z.number(),
  })).optional(),
  document_links: z.string().optional(),
}) satisfies z.ZodType<Property>;

export const contractSchema = z.object({
  id: z.number(),
  property_id: z.number().min(1, 'Imóvel é obrigatório'),
  tenant_id: z.number().min(1, 'Inquilino é obrigatório'),
  start_date: z.string().min(1, 'Data de início é obrigatória'),
  end_date: z.string().min(1, 'Data de fim é obrigatória'),
  rent_value: z.number().min(0.01, 'Valor do aluguel deve ser maior que 0'),
  due_day: z.number().min(1).max(31),
  adjustment_index: z.string().min(1, 'Índice de reajuste é obrigatório'),
  fees: z.number().min(0),
  charges: z.number().min(0),
  extra_charges: z.string().optional(),
  transfer_value: z.number().min(0),
  address: z.string().optional(),
  tenant_name: z.string().optional(),
  owner_name: z.string().optional(),
  guarantee_type: z.string().optional(),
  guarantee_value: z.number().optional(),
  guarantee_payment_date: z.string().optional(),
  guarantee_return_date: z.string().optional(),
  water_installation: z.string().optional(),
  electricity_installation: z.string().optional(),
  gas_installation: z.string().optional(),
  broker_id: z.number().optional(),
  broker_name: z.string().optional(),
  broker_commission_percent: z.number().optional(),
  agency_commission_value: z.number().optional(),
  document_links: z.string().optional(),
  iptu_status: z.enum(['pending', 'paid', 'n/a']).optional(),
  condo_status: z.enum(['pending', 'paid', 'n/a']).optional(),
  last_adjustment_date: z.string().optional(),
  next_adjustment_date: z.string().optional(),
  status: z.enum(['ativo', 'finalizado', 'suspenso']).optional(),
  admin_tax: z.number().optional(),
  asaas_subscription_id: z.string().optional(),
}) satisfies z.ZodType<Contract>;

export const paymentSchema = z.object({
  id: z.number(),
  contract_id: z.number().min(1, 'Contrato é obrigatório'),
  due_date: z.string().min(1, 'Data de vencimento é obrigatória'),
  received_date: z.string().nullable().optional(),
  payment_method: z.string().nullable().optional(),
  amount_paid: z.number().nullable().optional(),
  transfer_date: z.string().nullable().optional(),
  transfer_amount: z.number().nullable().optional(),
  extra_payments: z.string().optional(),
  status: z.enum(['pending', 'paid', 'overdue']),
  tenant_name: z.string().optional(),
  address: z.string().optional(),
  commission_value: z.number().optional(),
  broker_commission_value: z.number().optional(),
  asaas_id: z.string().optional(),
  asaas_status: z.string().optional(),
  transfer_status: z.enum(['pending', 'done']).optional(),
  broker_transfer_status: z.enum(['pending', 'done']).optional(),
  broker_transfer_date: z.string().optional(),
  broker_transfer_id: z.string().optional(),
  debts_value: z.number().optional(),
}) satisfies z.ZodType<Payment>;

export const brokerSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  document: z.string().min(1, 'Documento é obrigatório'),
  pix_key: z.string().min(1, 'Chave PIX é obrigatória'),
}) satisfies z.ZodType<Broker>;

export const inspectionSchema = z.object({
  id: z.number(),
  contract_id: z.number().min(1, 'Contrato é obrigatório'),
  type: z.enum(['check-in', 'check-out']),
  date: z.string().min(1, 'Data é obrigatória'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  photos_link: z.string().optional(),
  status: z.enum(['pending', 'completed']),
  address: z.string().optional(),
}) satisfies z.ZodType<Inspection>;

export const maintenanceSchema = z.object({
  id: z.number(),
  property_id: z.number().min(1, 'Imóvel é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  request_date: z.string().min(1, 'Data da solicitação é obrigatória'),
  estimated_cost: z.number().min(0),
  actual_cost: z.number().min(0),
  status: z.enum(['pending', 'approved', 'completed', 'rejected']),
  paid_by: z.enum(['owner', 'tenant', 'agency']),
  photos_link: z.string().optional(),
  address: z.string().optional(),
}) satisfies z.ZodType<Maintenance>;

// Array schemas for list responses
export const ownersArraySchema = z.array(ownerSchema);
export const tenantsArraySchema = z.array(tenantSchema);
export const propertiesArraySchema = z.array(propertySchema);
export const contractsArraySchema = z.array(contractSchema);
export const paymentsArraySchema = z.array(paymentSchema);
export const brokersArraySchema = z.array(brokerSchema);
export const inspectionsArraySchema = z.array(inspectionSchema);
export const maintenancesArraySchema = z.array(maintenanceSchema);

// Input schemas for mutations (without id for create)
export const createOwnerSchema = ownerSchema.omit({ id: true });
export const createTenantSchema = tenantSchema.omit({ id: true, asaas_id: true });
export const createPropertySchema = propertySchema.omit({ id: true, owner_name: true });
export const createContractSchema = contractSchema.omit({
  id: true,
  address: true,
  tenant_name: true,
  owner_name: true,
  asaas_subscription_id: true,
  status: true,
});
export const createPaymentSchema = paymentSchema.omit({
  id: true,
  tenant_name: true,
  address: true,
  commission_value: true,
  broker_commission_value: true,
  asaas_id: true,
  asaas_status: true,
  transfer_status: true,
  broker_transfer_status: true,
  broker_transfer_date: true,
  broker_transfer_id: true,
});
export const createBrokerSchema = brokerSchema.omit({ id: true });
export const createInspectionSchema = inspectionSchema.omit({ id: true });
export const createMaintenanceSchema = maintenanceSchema.omit({ id: true });

// Type inference
export type CreateOwner = z.infer<typeof createOwnerSchema>;
export type CreateTenant = z.infer<typeof createTenantSchema>;
export type CreateProperty = z.infer<typeof createPropertySchema>;
export type CreateContract = z.infer<typeof createContractSchema>;
export type CreatePayment = z.infer<typeof createPaymentSchema>;
export type CreateBroker = z.infer<typeof createBrokerSchema>;
export type CreateInspection = z.infer<typeof createInspectionSchema>;
export type CreateMaintenance = z.infer<typeof createMaintenanceSchema>;

// Generic fetch with error handling
async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error(error.message || `Erro ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

// API functions with Zod validation
export const api = {
  // Auth
  me: () => fetchJson<{ user: { id: number; email: string } }>('/api/me'),
  logout: () => fetchJson<void>('/api/auth/logout', { method: 'POST' }),

  // DB Status
  dbStatus: () => fetchJson<{ connected: boolean; tables: Record<string, boolean> }>('/api/public/db-status'),

  // Owners
  getOwners: () => fetchJson<Owner[]>('/api/owners').then(data => ownersArraySchema.parse(data)),
  getOwner: (id: number) => fetchJson<Owner>(`/api/owners/${id}`).then(data => ownerSchema.parse(data)),
  createOwner: (data: CreateOwner) => fetchJson<Owner>('/api/owners', {
    method: 'POST',
    body: JSON.stringify(createOwnerSchema.parse(data)),
  }).then(data => ownerSchema.parse(data)),
  updateOwner: (id: number, data: Partial<CreateOwner>) => fetchJson<Owner>(`/api/owners/${id}`, {
    method: 'PUT',
    body: JSON.stringify(createOwnerSchema.partial().parse(data)),
  }).then(data => ownerSchema.parse(data)),
  deleteOwner: (id: number) => fetchJson<void>(`/api/owners/${id}`, { method: 'DELETE' }),

  // Tenants
  getTenants: () => fetchJson<Tenant[]>('/api/tenants').then(data => tenantsArraySchema.parse(data)),
  getTenant: (id: number) => fetchJson<Tenant>(`/api/tenants/${id}`).then(data => tenantSchema.parse(data)),
  createTenant: (data: CreateTenant) => fetchJson<Tenant>('/api/tenants', {
    method: 'POST',
    body: JSON.stringify(createTenantSchema.parse(data)),
  }).then(data => tenantSchema.parse(data)),
  updateTenant: (id: number, data: Partial<CreateTenant>) => fetchJson<Tenant>(`/api/tenants/${id}`, {
    method: 'PUT',
    body: JSON.stringify(createTenantSchema.partial().parse(data)),
  }).then(data => tenantSchema.parse(data)),
  deleteTenant: (id: number) => fetchJson<void>(`/api/tenants/${id}`, { method: 'DELETE' }),
  syncAsaasTenant: (id: number) => fetchJson<Tenant>(`/api/asaas/sync-tenant/${id}`, { method: 'POST' }).then(data => tenantSchema.parse(data)),

  // Properties
  getProperties: () => fetchJson<Property[]>('/api/properties').then(data => propertiesArraySchema.parse(data)),
  getProperty: (id: number) => fetchJson<Property>(`/api/properties/${id}`).then(data => propertySchema.parse(data)),
  createProperty: (data: CreateProperty) => fetchJson<Property>('/api/properties', {
    method: 'POST',
    body: JSON.stringify(createPropertySchema.parse(data)),
  }).then(data => propertySchema.parse(data)),
  updateProperty: (id: number, data: Partial<CreateProperty>) => fetchJson<Property>(`/api/properties/${id}`, {
    method: 'PUT',
    body: JSON.stringify(createPropertySchema.partial().parse(data)),
  }).then(data => propertySchema.parse(data)),
  deleteProperty: (id: number) => fetchJson<void>(`/api/properties/${id}`, { method: 'DELETE' }),

  // Contracts
  getContracts: () => fetchJson<Contract[]>('/api/contracts').then(data => contractsArraySchema.parse(data)),
  getContract: (id: number) => fetchJson<Contract>(`/api/contracts/${id}`).then(data => contractSchema.parse(data)),
  createContract: (data: CreateContract) => fetchJson<Contract>('/api/contracts', {
    method: 'POST',
    body: JSON.stringify(createContractSchema.parse(data)),
  }).then(data => contractSchema.parse(data)),
  updateContract: (id: number, data: Partial<CreateContract>) => fetchJson<Contract>(`/api/contracts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(createContractSchema.partial().parse(data)),
  }).then(data => contractSchema.parse(data)),
  deleteContract: (id: number) => fetchJson<void>(`/api/contracts/${id}`, { method: 'DELETE' }),
  renewContract: (id: number, data: { end_date: string; new_rent_value?: number }) => fetchJson<Contract>(`/api/contracts/${id}/renew`, {
    method: 'POST',
    body: JSON.stringify(data),
  }).then(data => contractSchema.parse(data)),
  generatePayments: () => fetchJson<{ created: number }>('/api/contracts/generate-payments', { method: 'POST' }),

  // Payments
  getPayments: () => fetchJson<Payment[]>('/api/payments').then(data => paymentsArraySchema.parse(data)),
  getPayment: (id: number) => fetchJson<Payment>(`/api/payments/${id}`).then(data => paymentSchema.parse(data)),
  createPayment: (data: CreatePayment) => fetchJson<Payment>('/api/payments', {
    method: 'POST',
    body: JSON.stringify(createPaymentSchema.parse(data)),
  }).then(data => paymentSchema.parse(data)),
  updatePayment: (id: number, data: Partial<CreatePayment>) => fetchJson<Payment>(`/api/payments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(createPaymentSchema.partial().parse(data)),
  }).then(data => paymentSchema.parse(data)),
  deletePayment: (id: number) => fetchJson<void>(`/api/payments/${id}`, { method: 'DELETE' }),
  checkAsaasPayment: (id: number) => fetchJson<Payment>(`/api/asaas/check-payment/${id}`).then(data => paymentSchema.parse(data)),
  createAsaasPayment: (id: number) => fetchJson<Payment>(`/api/asaas/create-payment/${id}`, { method: 'POST' }).then(data => paymentSchema.parse(data)),
  transferPayment: (id: number) => fetchJson<Payment>(`/api/asaas/transfer/${id}`, { method: 'POST' }).then(data => paymentSchema.parse(data)),
  transferBroker: (id: number) => fetchJson<Payment>(`/api/asaas/transfer-broker/${id}`, { method: 'POST' }).then(data => paymentSchema.parse(data)),

  // Brokers
  getBrokers: () => fetchJson<Broker[]>('/api/brokers').then(data => brokersArraySchema.parse(data)),
  getBroker: (id: number) => fetchJson<Broker>(`/api/brokers/${id}`).then(data => brokerSchema.parse(data)),
  createBroker: (data: CreateBroker) => fetchJson<Broker>('/api/brokers', {
    method: 'POST',
    body: JSON.stringify(createBrokerSchema.parse(data)),
  }).then(data => brokerSchema.parse(data)),
  updateBroker: (id: number, data: Partial<CreateBroker>) => fetchJson<Broker>(`/api/brokers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(createBrokerSchema.partial().parse(data)),
  }).then(data => brokerSchema.parse(data)),
  deleteBroker: (id: number) => fetchJson<void>(`/api/brokers/${id}`, { method: 'DELETE' }),

  // Inspections
  getInspections: () => fetchJson<Inspection[]>('/api/inspections').then(data => inspectionsArraySchema.parse(data)),
  getInspection: (id: number) => fetchJson<Inspection>(`/api/inspections/${id}`).then(data => inspectionSchema.parse(data)),
  createInspection: (data: CreateInspection) => fetchJson<Inspection>('/api/inspections', {
    method: 'POST',
    body: JSON.stringify(createInspectionSchema.parse(data)),
  }).then(data => inspectionSchema.parse(data)),
  updateInspection: (id: number, data: Partial<CreateInspection>) => fetchJson<Inspection>(`/api/inspections/${id}`, {
    method: 'PUT',
    body: JSON.stringify(createInspectionSchema.partial().parse(data)),
  }).then(data => inspectionSchema.parse(data)),
  deleteInspection: (id: number) => fetchJson<void>(`/api/inspections/${id}`, { method: 'DELETE' }),

  // Maintenances
  getMaintenances: () => fetchJson<Maintenance[]>('/api/maintenances').then(data => maintenancesArraySchema.parse(data)),
  getMaintenance: (id: number) => fetchJson<Maintenance>(`/api/maintenances/${id}`).then(data => maintenanceSchema.parse(data)),
  createMaintenance: (data: CreateMaintenance) => fetchJson<Maintenance>('/api/maintenances', {
    method: 'POST',
    body: JSON.stringify(createMaintenanceSchema.parse(data)),
  }).then(data => maintenanceSchema.parse(data)),
  updateMaintenance: (id: number, data: Partial<CreateMaintenance>) => fetchJson<Maintenance>(`/api/maintenances/${id}`, {
    method: 'PUT',
    body: JSON.stringify(createMaintenanceSchema.partial().parse(data)),
  }).then(data => maintenanceSchema.parse(data)),
  deleteMaintenance: (id: number) => fetchJson<void>(`/api/maintenances/${id}`, { method: 'DELETE' }),

  // Asaas
  createSubscription: (contractId: number) => fetchJson<Contract>(`/api/asaas/create-subscription/${contractId}`, { method: 'POST' }).then(data => contractSchema.parse(data)),
  checkSubscription: (contractId: number) => fetchJson<Contract>(`/api/asaas/check-subscription/${contractId}`).then(data => contractSchema.parse(data)),

  // Import
  importData: (type: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`/api/import/${type}`, { method: 'POST', body: formData }).then(res => {
      if (!res.ok) throw new Error('Erro ao importar');
      return res.json();
    });
  },

  // Upload
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch('/api/upload', { method: 'POST', body: formData }).then(res => {
      if (!res.ok) throw new Error('Erro ao fazer upload');
      return res.json();
    });
  },
};