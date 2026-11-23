import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query';
import { api } from './api';
import type {
  Owner, Tenant, Property, Contract, Payment,
  Broker, Inspection, Maintenance,
  CreateOwner, CreateTenant, CreateProperty, CreateContract,
  CreatePayment, CreateBroker, CreateInspection, CreateMaintenance
} from './api';

// Query keys
export const queryKeys = {
  owners: ['owners'] as const,
  owner: (id: number) => ['owners', id] as const,
  tenants: ['tenants'] as const,
  tenant: (id: number) => ['tenants', id] as const,
  properties: ['properties'] as const,
  property: (id: number) => ['properties', id] as const,
  contracts: ['contracts'] as const,
  contract: (id: number) => ['contracts', id] as const,
  payments: ['payments'] as const,
  payment: (id: number) => ['payments', id] as const,
  brokers: ['brokers'] as const,
  broker: (id: number) => ['brokers', id] as const,
  inspections: ['inspections'] as const,
  inspection: (id: number) => ['inspections', id] as const,
  maintenances: ['maintenances'] as const,
  maintenance: (id: number) => ['maintenances', id] as const,
  me: ['me'] as const,
  dbStatus: ['dbStatus'] as const,
};

// Helper to invalidate related queries
export function useInvalidate() {
  const queryClient = useQueryClient();

  return {
    invalidateOwners: () => queryClient.invalidateQueries({ queryKey: queryKeys.owners }),
    invalidateTenants: () => queryClient.invalidateQueries({ queryKey: queryKeys.tenants }),
    invalidateProperties: () => queryClient.invalidateQueries({ queryKey: queryKeys.properties }),
    invalidateContracts: () => queryClient.invalidateQueries({ queryKey: queryKeys.contracts }),
    invalidatePayments: () => queryClient.invalidateQueries({ queryKey: queryKeys.payments }),
    invalidateBrokers: () => queryClient.invalidateQueries({ queryKey: queryKeys.brokers }),
    invalidateInspections: () => queryClient.invalidateQueries({ queryKey: queryKeys.inspections }),
    invalidateMaintenances: () => queryClient.invalidateQueries({ queryKey: queryKeys.maintenances }),
    invalidateAll: () => queryClient.invalidateQueries(),
  };
}

// Owners
export function useOwners(options?: UseQueryOptions<Owner[]>) {
  return useQuery({
    queryKey: queryKeys.owners,
    queryFn: api.getOwners,
    ...options,
  });
}

export function useOwner(id: number, options?: UseQueryOptions<Owner>) {
  return useQuery({
    queryKey: queryKeys.owner(id),
    queryFn: () => api.getOwner(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreateOwner(options?: UseMutationOptions<Owner, Error, CreateOwner>) {
  const { invalidateOwners } = useInvalidate();
  return useMutation({
    mutationFn: api.createOwner,
    onSuccess: () => invalidateOwners(),
    ...options,
  });
}

export function useUpdateOwner(options?: UseMutationOptions<Owner, Error, { id: number; data: Partial<CreateOwner> }>) {
  const { invalidateOwners } = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateOwner(id, data),
    onSuccess: () => invalidateOwners(),
    ...options,
  });
}

export function useDeleteOwner(options?: UseMutationOptions<void, Error, number>) {
  const { invalidateOwners } = useInvalidate();
  return useMutation({
    mutationFn: api.deleteOwner,
    onSuccess: () => invalidateOwners(),
    ...options,
  });
}

// Tenants
export function useTenants(options?: UseQueryOptions<Tenant[]>) {
  return useQuery({
    queryKey: queryKeys.tenants,
    queryFn: api.getTenants,
    ...options,
  });
}

export function useTenant(id: number, options?: UseQueryOptions<Tenant>) {
  return useQuery({
    queryKey: queryKeys.tenant(id),
    queryFn: () => api.getTenant(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreateTenant(options?: UseMutationOptions<Tenant, Error, CreateTenant>) {
  const { invalidateTenants } = useInvalidate();
  return useMutation({
    mutationFn: api.createTenant,
    onSuccess: () => invalidateTenants(),
    ...options,
  });
}

export function useUpdateTenant(options?: UseMutationOptions<Tenant, Error, { id: number; data: Partial<CreateTenant> }>) {
  const { invalidateTenants } = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateTenant(id, data),
    onSuccess: () => invalidateTenants(),
    ...options,
  });
}

export function useDeleteTenant(options?: UseMutationOptions<void, Error, number>) {
  const { invalidateTenants } = useInvalidate();
  return useMutation({
    mutationFn: api.deleteTenant,
    onSuccess: () => invalidateTenants(),
    ...options,
  });
}

export function useSyncAsaasTenant(options?: UseMutationOptions<Tenant, Error, number>) {
  const { invalidateTenants } = useInvalidate();
  return useMutation({
    mutationFn: api.syncAsaasTenant,
    onSuccess: () => invalidateTenants(),
    ...options,
  });
}

// Properties
export function useProperties(options?: UseQueryOptions<Property[]>) {
  return useQuery({
    queryKey: queryKeys.properties,
    queryFn: api.getProperties,
    ...options,
  });
}

export function useProperty(id: number, options?: UseQueryOptions<Property>) {
  return useQuery({
    queryKey: queryKeys.property(id),
    queryFn: () => api.getProperty(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreateProperty(options?: UseMutationOptions<Property, Error, CreateProperty>) {
  const { invalidateProperties } = useInvalidate();
  return useMutation({
    mutationFn: api.createProperty,
    onSuccess: () => invalidateProperties(),
    ...options,
  });
}

export function useUpdateProperty(options?: UseMutationOptions<Property, Error, { id: number; data: Partial<CreateProperty> }>) {
  const { invalidateProperties } = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateProperty(id, data),
    onSuccess: () => invalidateProperties(),
    ...options,
  });
}

export function useDeleteProperty(options?: UseMutationOptions<void, Error, number>) {
  const { invalidateProperties } = useInvalidate();
  return useMutation({
    mutationFn: api.deleteProperty,
    onSuccess: () => invalidateProperties(),
    ...options,
  });
}

// Contracts
export function useContracts(options?: UseQueryOptions<Contract[]>) {
  return useQuery({
    queryKey: queryKeys.contracts,
    queryFn: api.getContracts,
    ...options,
  });
}

export function useContract(id: number, options?: UseQueryOptions<Contract>) {
  return useQuery({
    queryKey: queryKeys.contract(id),
    queryFn: () => api.getContract(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreateContract(options?: UseMutationOptions<Contract, Error, CreateContract>) {
  const { invalidateContracts } = useInvalidate();
  return useMutation({
    mutationFn: api.createContract,
    onSuccess: () => invalidateContracts(),
    ...options,
  });
}

export function useUpdateContract(options?: UseMutationOptions<Contract, Error, { id: number; data: Partial<CreateContract> }>) {
  const { invalidateContracts } = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateContract(id, data),
    onSuccess: () => invalidateContracts(),
    ...options,
  });
}

export function useDeleteContract(options?: UseMutationOptions<void, Error, number>) {
  const { invalidateContracts } = useInvalidate();
  return useMutation({
    mutationFn: api.deleteContract,
    onSuccess: () => invalidateContracts(),
    ...options,
  });
}

export function useRenewContract(options?: UseMutationOptions<Contract, Error, { id: number; data: { end_date: string; new_rent_value?: number } }>) {
  const { invalidateContracts } = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }) => api.renewContract(id, data),
    onSuccess: () => invalidateContracts(),
    ...options,
  });
}

export function useGeneratePayments(options?: UseMutationOptions<{ created: number }, Error>) {
  const { invalidatePayments } = useInvalidate();
  return useMutation({
    mutationFn: api.generatePayments,
    onSuccess: () => invalidatePayments(),
    ...options,
  });
}

// Payments
export function usePayments(options?: UseQueryOptions<Payment[]>) {
  return useQuery({
    queryKey: queryKeys.payments,
    queryFn: api.getPayments,
    ...options,
  });
}

export function usePayment(id: number, options?: UseQueryOptions<Payment>) {
  return useQuery({
    queryKey: queryKeys.payment(id),
    queryFn: () => api.getPayment(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreatePayment(options?: UseMutationOptions<Payment, Error, CreatePayment>) {
  const { invalidatePayments } = useInvalidate();
  return useMutation({
    mutationFn: api.createPayment,
    onSuccess: () => invalidatePayments(),
    ...options,
  });
}

export function useUpdatePayment(options?: UseMutationOptions<Payment, Error, { id: number; data: Partial<CreatePayment> }>) {
  const { invalidatePayments } = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }) => api.updatePayment(id, data),
    onSuccess: () => invalidatePayments(),
    ...options,
  });
}

export function useDeletePayment(options?: UseMutationOptions<void, Error, number>) {
  const { invalidatePayments } = useInvalidate();
  return useMutation({
    mutationFn: api.deletePayment,
    onSuccess: () => invalidatePayments(),
    ...options,
  });
}

export function useCheckAsaasPayment(options?: UseMutationOptions<Payment, Error, number>) {
  const { invalidatePayments } = useInvalidate();
  return useMutation({
    mutationFn: api.checkAsaasPayment,
    onSuccess: () => invalidatePayments(),
    ...options,
  });
}

export function useCreateAsaasPayment(options?: UseMutationOptions<Payment, Error, number>) {
  const { invalidatePayments } = useInvalidate();
  return useMutation({
    mutationFn: api.createAsaasPayment,
    onSuccess: () => invalidatePayments(),
    ...options,
  });
}

export function useTransferPayment(options?: UseMutationOptions<Payment, Error, number>) {
  const { invalidatePayments } = useInvalidate();
  return useMutation({
    mutationFn: api.transferPayment,
    onSuccess: () => invalidatePayments(),
    ...options,
  });
}

export function useTransferBroker(options?: UseMutationOptions<Payment, Error, number>) {
  const { invalidatePayments } = useInvalidate();
  return useMutation({
    mutationFn: api.transferBroker,
    onSuccess: () => invalidatePayments(),
    ...options,
  });
}

// Brokers
export function useBrokers(options?: UseQueryOptions<Broker[]>) {
  return useQuery({
    queryKey: queryKeys.brokers,
    queryFn: api.getBrokers,
    ...options,
  });
}

export function useBroker(id: number, options?: UseQueryOptions<Broker>) {
  return useQuery({
    queryKey: queryKeys.broker(id),
    queryFn: () => api.getBroker(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreateBroker(options?: UseMutationOptions<Broker, Error, CreateBroker>) {
  const { invalidateBrokers } = useInvalidate();
  return useMutation({
    mutationFn: api.createBroker,
    onSuccess: () => invalidateBrokers(),
    ...options,
  });
}

export function useUpdateBroker(options?: UseMutationOptions<Broker, Error, { id: number; data: Partial<CreateBroker> }>) {
  const { invalidateBrokers } = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateBroker(id, data),
    onSuccess: () => invalidateBrokers(),
    ...options,
  });
}

export function useDeleteBroker(options?: UseMutationOptions<void, Error, number>) {
  const { invalidateBrokers } = useInvalidate();
  return useMutation({
    mutationFn: api.deleteBroker,
    onSuccess: () => invalidateBrokers(),
    ...options,
  });
}

// Inspections
export function useInspections(options?: UseQueryOptions<Inspection[]>) {
  return useQuery({
    queryKey: queryKeys.inspections,
    queryFn: api.getInspections,
    ...options,
  });
}

export function useInspection(id: number, options?: UseQueryOptions<Inspection>) {
  return useQuery({
    queryKey: queryKeys.inspection(id),
    queryFn: () => api.getInspection(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreateInspection(options?: UseMutationOptions<Inspection, Error, CreateInspection>) {
  const { invalidateInspections } = useInvalidate();
  return useMutation({
    mutationFn: api.createInspection,
    onSuccess: () => invalidateInspections(),
    ...options,
  });
}

export function useUpdateInspection(options?: UseMutationOptions<Inspection, Error, { id: number; data: Partial<CreateInspection> }>) {
  const { invalidateInspections } = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateInspection(id, data),
    onSuccess: () => invalidateInspections(),
    ...options,
  });
}

export function useDeleteInspection(options?: UseMutationOptions<void, Error, number>) {
  const { invalidateInspections } = useInvalidate();
  return useMutation({
    mutationFn: api.deleteInspection,
    onSuccess: () => invalidateInspections(),
    ...options,
  });
}

// Maintenances
export function useMaintenances(options?: UseQueryOptions<Maintenance[]>) {
  return useQuery({
    queryKey: queryKeys.maintenances,
    queryFn: api.getMaintenances,
    ...options,
  });
}

export function useMaintenance(id: number, options?: UseQueryOptions<Maintenance>) {
  return useQuery({
    queryKey: queryKeys.maintenance(id),
    queryFn: () => api.getMaintenance(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreateMaintenance(options?: UseMutationOptions<Maintenance, Error, CreateMaintenance>) {
  const { invalidateMaintenances } = useInvalidate();
  return useMutation({
    mutationFn: api.createMaintenance,
    onSuccess: () => invalidateMaintenances(),
    ...options,
  });
}

export function useUpdateMaintenance(options?: UseMutationOptions<Maintenance, Error, { id: number; data: Partial<CreateMaintenance> }>) {
  const { invalidateMaintenances } = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateMaintenance(id, data),
    onSuccess: () => invalidateMaintenances(),
    ...options,
  });
}

export function useDeleteMaintenance(options?: UseMutationOptions<void, Error, number>) {
  const { invalidateMaintenances } = useInvalidate();
  return useMutation({
    mutationFn: api.deleteMaintenance,
    onSuccess: () => invalidateMaintenances(),
    ...options,
  });
}

// Auth
export function useMe(options?: UseQueryOptions<{ user: { id: number; email: string } }>) {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: api.me,
    retry: false,
    ...options,
  });
}

export function useLogout(options?: UseMutationOptions<void, Error>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.logout,
    onSuccess: () => {
      queryClient.clear();
    },
    ...options,
  });
}

// DB Status
export function useDbStatus(options?: UseQueryOptions<{ connected: boolean; tables: Record<string, boolean> }>) {
  return useQuery({
    queryKey: queryKeys.dbStatus,
    queryFn: api.dbStatus,
    ...options,
  });
}

// Asaas
export function useCreateSubscription(options?: UseMutationOptions<Contract, Error, number>) {
  const { invalidateContracts } = useInvalidate();
  return useMutation({
    mutationFn: api.createSubscription,
    onSuccess: () => invalidateContracts(),
    ...options,
  });
}

export function useCheckSubscription(options?: UseMutationOptions<Contract, Error, number>) {
  const { invalidateContracts } = useInvalidate();
  return useMutation({
    mutationFn: api.checkSubscription,
    onSuccess: () => invalidateContracts(),
    ...options,
  });
}

// Import
export function useImportData(options?: UseMutationOptions<any, Error, { type: string; file: File }>) {
  return useMutation({
    mutationFn: ({ type, file }) => api.importData(type, file),
    ...options,
  });
}

// Upload
export function useUploadFile(options?: UseMutationOptions<any, Error, File>) {
  return useMutation({
    mutationFn: api.uploadFile,
    ...options,
  });
}