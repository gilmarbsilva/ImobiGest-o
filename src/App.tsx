import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  FileText,
  Home,
  DollarSign,
  Plus,
  Search,
  LayoutDashboard,
  Calendar,
  CreditCard,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  Printer,
  Download,
  ShieldCheck,
  RefreshCw,
  UserPlus,
  Trash2,
  LogOut,
  Shield,
  ExternalLink,
  Zap,
  MessageCircle,
  Upload,
  Database,
  BookOpen,
  FileSpreadsheet,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Filter,
  List,
  Settings,
  TrendingUp,
  Wrench,
  ArrowRight,
  Loader2,
  Menu,
  X
} from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  // existing imports...
  // Add MobileNav component later
 motion, AnimatePresence } from 'motion/react';
import { Owner, Tenant, Property, Contract, Payment, Broker, Inspection, Maintenance } from './types';
import Auth from './Auth';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const FinancialCard = ({ title, value, liquidValue, clients, charges, color, progress, onClick, isActive }: any) => {
  const colors: any = {
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    red: 'text-red-600 bg-red-50 border-red-100'
  };

  const progressColors: any = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-400',
    amber: 'bg-amber-400',
    red: 'bg-red-400'
  };

  const activeBorderColors: any = {
    emerald: 'border-emerald-500 shadow-emerald-100 ring-emerald-500/20',
    blue: 'border-blue-500 shadow-blue-100 ring-blue-500/20',
    amber: 'border-amber-500 shadow-amber-100 ring-amber-500/20',
    red: 'border-red-500 shadow-red-100 ring-red-500/20'
  };

  const activeIconColors: any = {
    emerald: 'bg-emerald-50 text-emerald-500',
    blue: 'bg-blue-50 text-blue-500',
    amber: 'bg-amber-50 text-amber-500',
    red: 'bg-red-50 text-red-500'
  };

  return (
    <div 
      onClick={onClick}
      className={`p-6 rounded-[2rem] border transition-all cursor-pointer select-none active:scale-95 ${
        isActive 
          ? `bg-white shadow-lg ring-2 ${activeBorderColors[color] || 'border-slate-500 shadow-slate-100 ring-slate-500/20'}` 
          : 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-slate-500 text-sm font-bold">{title}</h3>
        <div className={`p-1.5 rounded-full ${isActive ? (activeIconColors[color] || 'bg-slate-50 text-slate-500') : 'bg-slate-50 text-slate-300'}`}>
          <HelpCircle size={14} />
        </div>
      </div>
      
      <div className="mb-4">
        <div className={`text-3xl font-black ${colors[color].split(' ')[0]}`}>
          R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
        {liquidValue > 0 && (
          <div className="text-xs text-slate-400 font-bold mt-1">
            R$ {liquidValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} líquido
          </div>
        )}
      </div>

      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
        <div 
          className={`h-full ${progressColors[color]} transition-all duration-1000 ease-out`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-slate-600 group/row">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-slate-400 group-hover:text-blue-500" />
            <span className="text-sm font-bold">{clients} {clients === 1 ? 'cliente' : 'clientes'}</span>
          </div>
          <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500" />
        </div>
        <div className="flex items-center justify-between text-slate-600 group/row">
          <div className="flex items-center gap-2">
            <CreditCard size={16} className="text-slate-400 group-hover:text-blue-500" />
            <span className="text-sm font-bold">{charges} {charges === 1 ? 'cobrança' : 'cobranças'}</span>
          </div>
          <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500" />
        </div>
      </div>
    </div>
  );
};

const FileUpload = ({ onUpload, label }: { onUpload: (url: string) => void, label?: string }) => {
  const [uploading, setUploading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', e.target.files[0]);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        onUpload(data.url);
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch (e) {
      alert('Erro ao conectar com o servidor.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
      <div className="relative group">
        <input
          type="file"
          onChange={handleChange}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className={`p-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all ${uploading ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200 group-hover:border-emerald-500 group-hover:bg-emerald-50'
          }`}>
          {uploading ? (
            <div className="flex items-center space-x-2 text-slate-500">
              <RefreshCw className="animate-spin" size={20} />
              <span className="text-sm">Enviando...</span>
            </div>
          ) : (
            <>
              <Upload className="text-slate-400 mb-2 group-hover:text-emerald-500" size={24} />
              <span className="text-xs text-slate-500 group-hover:text-emerald-600">Escolher Documento/Foto</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [owners, setOwners] = useState<Owner[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [extraCharges, setExtraCharges] = useState<{ description: string, value: number, period: string }[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [renewingContract, setRenewingContract] = useState<Contract | null>(null);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [contractStatusFilter, setContractStatusFilter] = useState<'todos' | 'ativos' | 'vencidos' | 'finalizados'>('ativos');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRepasseModal, setShowRepasseModal] = useState(false);
  const [showRepasseDetailModal, setShowRepasseDetailModal] = useState(false);
  const [ignoreDateFilter, setIgnoreDateFilter] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [extraPayments, setExtraPayments] = useState<{ description: string, value: number }[]>([]);
  const [secondaryOwners, setSecondaryOwners] = useState<{ owner_id: number, share_percent: number }[]>([]);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  const [debtsValue, setDebtsValue] = useState<number>(0);
  const [reportStartDate, setReportStartDate] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [reportEndDate, setReportEndDate] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
  );
  const [printType, setPrintType] = useState<'all' | 'financial' | 'contracts' | 'details'>('all');

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [user, setUser] = useState<{ id: string | number, name: string, email?: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [paymentFilterStatus, setPaymentFilterStatus] = useState<string | null>(null);
  const [showFinancialFilters, setShowFinancialFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [repasseOwnerFilter, setRepasseOwnerFilter] = useState<string>('');
  const [showSidebar, setShowSidebar] = useState(false);

  // Helpers de filtragem global
  const filterList = (list: any[]) => {
    if (!searchTerm) return list;
    const search = searchTerm.toLowerCase();
    return list.filter(item => 
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(search)
      )
    );
  };

  const [dbStatus, setDbStatus] = useState<{ connected: boolean, error?: string, hasUsers?: boolean } | null>(null);

  useEffect(() => {
    checkAuth();
    checkDbStatus();
  }, []);

  // Background Sync para faturas do Asaas
  useEffect(() => {
    if (activeTab === 'financial' && filteredPayments.length > 0) {
      const pendingAsaas = filteredPayments.filter(p => p.status === 'pending' && p.asaas_id);
      if (pendingAsaas.length > 0) {
        console.log(`[SYNC] Verificando status de ${pendingAsaas.length} faturas pendentes...`);
        // Sincroniza apenas as 3 primeiras para não sobrecarregar
        pendingAsaas.slice(0, 3).forEach(p => {
          fetch(`/api/asaas/check-payment/${p.id}`).then(() => fetchData());
        });
      }
    }
  }, [activeTab]);

  const checkDbStatus = async () => {
    try {
      const res = await fetch('/api/public/db-status');
      const data = await res.json();
      setDbStatus(data);
    } catch (e) {
      setDbStatus({ connected: false, error: 'Erro ao conectar com o servidor' });
    }
  };

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/me');
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        fetchData();
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error("Auth check failed", e);
      setUser(null);
    } finally {
      setAuthChecked(true);
    }
  };

  const handlePrint = (type: typeof printType) => {
    setPrintType(type);
    setTimeout(() => {
      window.print();
      setPrintType('all');
    }, 100);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  const triggerBackup = () => {
    window.location.href = '/api/backup/download';
    localStorage.setItem('imobi_last_backup', new Date().toISOString());
  };

  useEffect(() => {
    const checkBackup = () => {
      const lastBackup = localStorage.getItem('imobi_last_backup');
      const autoBackupEnabled = localStorage.getItem('imobi_auto_backup') === 'true';

      if (autoBackupEnabled) {
        const now = new Date();
        const lastDate = lastBackup ? new Date(lastBackup) : new Date(0);
        const hoursSinceLast = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);

        if (hoursSinceLast >= 24) { // Auto backup every 24 hours
          triggerBackup();
        }
      }
    };

    const interval = setInterval(checkBackup, 1000 * 60 * 60); // Check every hour
    checkBackup(); // Check on load
    return () => clearInterval(interval);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const responses = await Promise.all([
        fetch('/api/owners'),
        fetch('/api/tenants'),
        fetch('/api/properties'),
        fetch('/api/contracts'),
        fetch('/api/payments'),
        fetch('/api/brokers'),
        fetch('/api/inspections'),
        fetch('/api/maintenances')
      ]);

      let authFailed = false;
      const data = await Promise.all(responses.map(async (res, index) => {
        if (res.status === 401) {
          if (!authFailed) {
            authFailed = true;
            console.error(`Recebido 401 na requisição, redirecionando para login...`);
            setTimeout(() => {
              alert('Sua sessão de login está inválida ou expirou. Por favor, tente logar novamente.');
            }, 500);
            setUser(null);
          }
          return [];
        }
        return res.ok ? await res.json() : [];
      }));
      const [o, t, p, c, pay, b, insp, maint] = data;

      if (Array.isArray(o)) setOwners(o);
      if (Array.isArray(t)) setTenants(t);
      if (Array.isArray(p)) setProperties(p);
      if (Array.isArray(c)) setContracts(c);
      if (Array.isArray(pay)) setPayments(pay);
      if (Array.isArray(b)) setBrokers(b);
      if (Array.isArray(insp)) setInspections(insp);
      if (Array.isArray(maint)) setMaintenances(maint);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = (Array.isArray(payments) ? payments : []).filter(p => {
    if (ignoreDateFilter) return true;

    // Pegamos apenas a parte da data (YYYY-MM-DD) caso venha com timestamp
    const dueDate = p.due_date?.substring(0, 10);
    const receivedDate = p.received_date?.substring(0, 10);

    const isDueInRange = dueDate && dueDate >= reportStartDate && dueDate <= reportEndDate;
    const isReceivedInRange = receivedDate && receivedDate >= reportStartDate && receivedDate <= reportEndDate;

    return isDueInRange || isReceivedInRange;
  });

  // Filtragem composta para a tabela financeira — elimina lógica duplicada
  const displayedPayments = filteredPayments.filter(p => {
    if (paymentFilterStatus === 'paid') return p.status === 'paid';
    if (paymentFilterStatus === 'CONFIRMED') return p.asaas_status === 'CONFIRMED';
    if (paymentFilterStatus === 'pending') return p.status === 'pending' && new Date(p.due_date) >= new Date();
    if (paymentFilterStatus === 'overdue') return p.status === 'pending' && new Date(p.due_date) < new Date();
    return true;
  }).filter(p => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return p.tenant_name?.toLowerCase().includes(s) || p.address?.toLowerCase().includes(s) || p.owner_name?.toLowerCase().includes(s);
  });

  const handleCreateBroker = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      if (editingItem) {
        const res = await fetch(`/api/brokers/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
      } else {
        const res = await fetch('/api/brokers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
      }
      setShowModal(false);
      setEditingItem(null);
      fetchData();
    } catch (e: any) {
      alert(`Erro ao salvar corretor: ${e.message}`);
    }
  };

  const handleCreateInspection = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      if (editingItem) {
        const res = await fetch(`/api/inspections/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
      } else {
        const res = await fetch('/api/inspections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
      }
      setShowModal(false);
      setEditingItem(null);
      fetchData();
    } catch (e: any) {
      alert(`Erro ao salvar vistoria: ${e.message}`);
    }
  };

  const handleCreateMaintenance = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      if (editingItem) {
        const res = await fetch(`/api/maintenances/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
      } else {
        const res = await fetch('/api/maintenances', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
      }
      setShowModal(false);
      setEditingItem(null);
      fetchData();
    } catch (e: any) {
      alert(`Erro ao salvar manutenção: ${e.message}`);
    }
  };

  const handleDelete = async (type: string, id: number) => {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return;
    try {
      const res = await fetch(`/api/${type}/${id}`, { method: 'DELETE' });
      if (res.status === 401) {
        alert("Sua sessão expirou. Por favor, faça login novamente.");
        setUser(null);
        return;
      }
      if (res.ok) {
        fetchData();
      } else {
        const errorData = await res.json().catch(() => ({ error: res.statusText }));
        alert(`Erro ao excluir: ${errorData.error || errorData}`);
      }
    } catch (e: any) {
      alert(`Erro ao excluir: ${e.message}`);
    }
  };

  const handleCreateOwner = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      if (editingItem) {
        const res = await fetch(`/api/owners/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
      } else {
        const res = await fetch('/api/owners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
      }
      setShowModal(false);
      setEditingItem(null);
      fetchData();
    } catch (e: any) {
      alert(`Erro ao salvar proprietário: ${e.message}`);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      if (editingItem) {
        const res = await fetch(`/api/tenants/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
      } else {
        const res = await fetch('/api/tenants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
      }
      setShowModal(false);
      setEditingItem(null);
      fetchData();
    } catch (e: any) {
      alert(`Erro ao salvar inquilino: ${e.message}`);
    }
  };

  const handleCreateProperty = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const payload = {
        ...data,
        secondary_owners: secondaryOwners
      };

      if (editingItem) {
        const res = await fetch(`/api/properties/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(await res.text());
      } else {
        const res = await fetch('/api/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(await res.text());
      }
      setShowModal(false);
      setEditingItem(null);
      setSecondaryOwners([]);
      fetchData();
    } catch (e: any) {
      alert(`Erro ao salvar imóvel: ${e.message}`);
    }
  };

  const handleCreateContract = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const payload = {
        ...data,
        extra_charges: JSON.stringify(extraCharges)
      };

      if (editingItem) {
        const res = await fetch(`/api/contracts/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(await res.text());
      } else {
        const res = await fetch('/api/contracts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(await res.text());
        const { id } = await res.json();

        // Create initial payment
        const contract = data as any;
        const today = new Date();
        const dueDate = new Date(today.getFullYear(), today.getMonth(), parseInt(contract.due_day));
        if (dueDate < today) dueDate.setMonth(dueDate.getMonth() + 1);

        await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contract_id: id,
            due_date: dueDate.toISOString().split('T')[0],
            status: 'pending'
          })
        });
      }

      setShowModal(false);
      setEditingItem(null);
      setExtraCharges([]);
      fetchData();
    } catch (e: any) {
      alert(`Erro ao salvar contrato: ${e.message}`);
    }
  };

  const handleRenewContract = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!renewingContract) return;
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      // 1. Create the new contract
      const newContractPayload = {
        property_id: renewingContract.property_id,
        tenant_id: renewingContract.tenant_id,
        start_date: data.start_date,
        end_date: data.end_date,
        rent_value: data.rent_value,
        due_day: data.due_day,
        admin_tax: data.admin_tax,
        adjustment_index: data.adjustment_index,
        guarantee_type: data.guarantee_type,
        guarantee_value: data.guarantee_value,
        charges: renewingContract.charges || 0,
        transfer_value: renewingContract.transfer_value || 0,
        water_installation: renewingContract.water_installation || '',
        electricity_installation: renewingContract.electricity_installation || '',
        gas_installation: renewingContract.gas_installation || '',
        broker_id: renewingContract.broker_id || null,
        broker_commission_percent: renewingContract.broker_commission_percent || 0,
        agency_commission_value: renewingContract.agency_commission_value || 0,
        iptu_status: renewingContract.iptu_status || 'pending',
        condo_status: renewingContract.condo_status || 'pending',
        status: 'ativo',
        extra_charges: renewingContract.extra_charges || '[]'
      };

      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContractPayload)
      });
      if (!res.ok) throw new Error(await res.text());
      const { id } = await res.json();

      // Create initial payment
      const today = new Date();
      const dueDate = new Date(today.getFullYear(), today.getMonth(), parseInt(data.due_day as string));
      if (dueDate < today) dueDate.setMonth(dueDate.getMonth() + 1);

      await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract_id: id,
          due_date: dueDate.toISOString().split('T')[0],
          status: 'pending'
        })
      });

      // 2. Mark old contract as finished ('finalizado')
      const updateOldRes = await fetch(`/api/contracts/${renewingContract.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...renewingContract,
          status: 'finalizado'
        })
      });
      if (!updateOldRes.ok) throw new Error(await updateOldRes.text());

      showToast('Contrato renovado com sucesso!', 'success');
      setShowRenewModal(false);
      setRenewingContract(null);
      fetchData();
    } catch (e: any) {
      showToast(`Erro ao renovar contrato: ${e.message}`, 'error');
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      // Garantir que pegamos apenas a parte da data caso venha com timestamp
      const pureDate = dateStr.substring(0, 10);
      const [year, month, day] = pureDate.split('-');
      if (!day || !month || !year) return dateStr;
      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  const handleUpdatePayment = async (id: number, updates: Partial<Payment>) => {
    await fetch(`/api/payments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    fetchData();
  };

  const handleProcessPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPayment) return;

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const payload = {
      ...data,
      amount_paid: parseFloat(data.amount_paid as string),
      transfer_amount: parseFloat(data.transfer_amount as string),
      debts_value: parseFloat(data.debts_value as string) || 0,
      extra_payments: JSON.stringify(extraPayments),
      status: 'paid' as const
    };

    await handleUpdatePayment(selectedPayment.id, payload);
    setShowPaymentModal(false);
    setSelectedPayment(null);
    setExtraPayments([]);
  };

  const handleAsaasSync = async (tenantId: number) => {
    try {
      const res = await fetch(`/api/asaas/sync-tenant/${tenantId}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert('Inquilino sincronizado com Asaas com sucesso!');
        fetchData();
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch (e) {
      alert('Erro ao conectar com o servidor.');
    }
  };

  const handleAsaasPayment = async (paymentId: number) => {
    try {
      const res = await fetch(`/api/asaas/create-payment/${paymentId}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert('Cobrança gerada no Asaas!');
        if (data.invoiceUrl) window.open(data.invoiceUrl, '_blank');
        fetchData();
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch (e) {
      alert('Erro ao conectar com o servidor.');
    }
  };

  const handleManualTransfer = async (paymentId: number) => {
    if (!confirm('Confirmar repasse manual para o proprietário? O status de repasse do pagamento será atualizado para concluído.')) return;
    try {
      await handleUpdatePayment(paymentId, { 
        transfer_status: 'done',
        transfer_date: new Date().toISOString().split('T')[0]
      });
      showToast('Repasse manual registrado com sucesso!', 'success');
      setShowRepasseDetailModal(false);
      setShowRepasseModal(false);
      fetchData();
    } catch (e) {
      showToast('Erro ao atualizar status de repasse.', 'error');
    }
  };

  const handleAsaasTransfer = async (paymentId: number) => {
    if (!confirm('Deseja realizar o repasse para o proprietário via Asaas agora?')) return;
    try {
      const res = await fetch(`/api/asaas/transfer/${paymentId}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert('Repasse realizado com sucesso!');
        setShowRepasseDetailModal(false);
        setShowRepasseModal(false);
        fetchData();

        // Notificação WhatsApp
        const payment = payments.find(p => p.id === paymentId);
        const property = properties.find(prop => prop.id === contracts.find(c => c.id === payment?.contract_id)?.property_id);
        const owner = owners.find(o => o.id === property?.owner_id);

        if (owner?.phone && confirm('Deseja notificar o proprietário via WhatsApp?')) {
          const message = `Olá ${owner.name}, informamos que o repasse referente ao aluguel do imóvel ${property?.address} foi realizado com sucesso. Valor: R$ ${payment?.transfer_amount?.toLocaleString('pt-BR')}.`;
          const whatsappUrl = `https://wa.me/55${owner.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
          window.open(whatsappUrl, '_blank');
        }
      } else {
        alert(`Erro: ${data.error || 'Verifique os dados bancários do proprietário.'}`);
      }
    } catch (e) {
      alert('Erro ao conectar com o servidor.');
    }
  };

  const handleAsaasCheck = async (paymentId: number) => {
    try {
      showToast('Conferindo status no Asaas...', 'info');
      const res = await fetch(`/api/asaas/check-payment/${paymentId}`);
      const data = await res.json();
      if (res.ok) {
        showToast(`Status Asaas: ${data.status}. Local: ${data.localStatus}`, 'success');
        fetchData();
      } else {
        showToast(`Erro: ${data.error}`, 'error');
      }
    } catch (e) {
      showToast('Erro ao conectar com o servidor.', 'error');
    }
  };

  const handleAsaasBrokerTransfer = async (paymentId: number) => {
    if (!confirm('Deseja realizar o repasse da comissão para o corretor via PIX Asaas agora?')) return;
    try {
      showToast('Processando repasse ao corretor...', 'info');
      const res = await fetch(`/api/asaas/transfer-broker/${paymentId}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showToast('Repasse ao corretor realizado com sucesso!', 'success');
        fetchData();
      } else {
        showToast(`Erro: ${data.error || 'Verifique a chave PIX do corretor.'}`, 'error');
      }
    } catch (e) {
      showToast('Erro ao conectar com o servidor.', 'error');
    }
  };

  const handleAsaasSubscription = async (contractId: number) => {
    if (!confirm('Deseja criar uma assinatura mensal no Asaas para este contrato? Isso automatizará a geração de cobranças.')) return;
    try {
      showToast('Criando assinatura no Asaas...', 'info');
      const res = await fetch(`/api/asaas/create-subscription/${contractId}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showToast('Assinatura criada com sucesso!', 'success');
        fetchData();
      } else {
        showToast(`Erro: ${data.error}`, 'error');
      }
    } catch (e) {
      showToast('Erro ao conectar com o servidor.', 'error');
    }
  };

  const handleCheckSubscription = async (contractId: number) => {
    try {
      showToast('Verificando status da assinatura...', 'info');
      const res = await fetch(`/api/asaas/check-subscription/${contractId}`);
      const data = await res.json();
      if (res.ok) {
        if (!data.active) {
          showToast('Assinatura excluída no Asaas. Sincronizado!', 'success');
        } else {
          showToast('Assinatura ainda está ativa no Asaas.', 'success');
        }
        fetchData();
      } else {
        showToast(`Erro: ${data.error}`, 'error');
      }
    } catch (e) {
      showToast('Erro ao conectar com o servidor.', 'error');
    }
  };

  const handleGeneratePayments = async () => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    if (!confirm(`Deseja gerar as mensalidades de todos os contratos ativos para o mês ${month}/${year}?`)) return;

    try {
      const res = await fetch('/api/contracts/generate-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, year })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, 'success');
        fetchData();
      } else {
        showToast(data.error, 'error');
      }
    } catch (e) {
      showToast('Erro ao conectar com o servidor.', 'error');
    }
  };

  const handleImportFile = (type: 'owners' | 'tenants' | 'properties', file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        let jsonData: any[] = [];

        if (file.name.endsWith('.csv')) {
          const results = Papa.parse(data as string, { header: true, skipEmptyLines: true });
          jsonData = results.data;
        } else {
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          jsonData = XLSX.utils.sheet_to_json(worksheet);
        }

        const res = await fetch(`/api/import/${type}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jsonData)
        });

        const responseData = await res.json();
        if (res.ok) {
          alert(`${responseData.count} registros importados com sucesso!`);
          fetchData();
        } else {
          alert(`Erro na importação: ${responseData.error}`);
        }
      } catch (err) {
        alert('Erro ao processar arquivo. Verifique se o formato está correto.');
      }
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const SidebarItem = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
    <button
      onClick={() => { setActiveTab(id); setShowSidebar(false); }}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'text-slate-500 hover:bg-slate-100'}`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  // Mobile navigation component for small screens
  const MobileNav = () => (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 lg:hidden">
      {[{id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard'},
        {id: 'owners', icon: Users, label: 'Proprietários'},
        {id: 'tenants', icon: UserCheck, label: 'Inquilinos'},
        {id: 'properties', icon: Home, label: 'Imóveis'},
        {id: 'contracts', icon: FileText, label: 'Contratos'},
        {id: 'financial', icon: DollarSign, label: 'Financeiro'}].map(item => (
        <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center text-xs ${activeTab === item.id ? 'text-emerald-500' : 'text-slate-500'}`}>
          <item.icon size={20} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );

  if (!authChecked) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return <Auth onLogin={(u) => { setUser(u); fetchData(); }} />;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 p-6 flex flex-col transform transition-transform duration-300 ease-in-out ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <Home size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">ImobiGestão</h1>
          </div>
          <button 
            onClick={() => setShowSidebar(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-2 flex-1 overflow-y-auto">
          <SidebarItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem id="owners" icon={Users} label="Proprietários" />
          <SidebarItem id="tenants" icon={UserCheck} label="Inquilinos" />
          <SidebarItem id="properties" icon={Home} label="Imóveis" />
          <SidebarItem id="contracts" icon={FileText} label="Contratos" />
          <SidebarItem id="inspections" icon={ShieldCheck} label="Vistorias" />
          <SidebarItem id="maintenances" icon={RefreshCw} label="Manutenções" />
          <SidebarItem id="brokers" icon={UserPlus} label="Corretores" />
          <SidebarItem id="financial" icon={DollarSign} label="Financeiro" />
          <SidebarItem id="repasse" icon={ArrowRightLeft} label="Repasses" />
          <SidebarItem id="reports" icon={BarChart3} label="Relatórios" />
          <SidebarItem id="manual" icon={BookOpen} label="Manual & Ajuda" />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100 space-y-4">
          <button
            onClick={() => window.open('/api/backup', '_blank')}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-100 transition-all duration-200"
            title="Baixar backup do banco de dados"
          >
            <Download size={20} />
            <span className="font-medium">Backup DB</span>
          </button>

          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-xs">
                {user?.name?.[0] || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate max-w-[120px]">{user?.name || 'Usuário'}</p>
                <p className="text-xs text-slate-400">Gestor</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
        <header className="flex justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight capitalize">
              {activeTab === 'dashboard' ? 'Visão Geral' 
                : activeTab === 'manual' ? 'Manual & Ajuda' 
                : activeTab === 'brokers' ? 'Corretores' 
                : activeTab === 'inspections' ? 'Vistorias' 
                : activeTab === 'maintenances' ? 'Manutenções' 
                : activeTab === 'owners' ? 'Proprietários'
                : activeTab === 'tenants' ? 'Inquilinos'
                : activeTab === 'properties' ? 'Imóveis'
                : activeTab === 'contracts' ? 'Contratos'
                : activeTab === 'financial' ? 'Financeiro'
                : activeTab === 'repasse' ? 'Repasses'
                : activeTab === 'reports' ? 'Relatórios'
                : activeTab}
            </h2>
            <p className="text-slate-500">Bem-vindo ao seu painel de controle imobiliário.</p>
          </div>
          <div className="flex space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all w-64"
              />
            </div>
            {activeTab !== 'dashboard' && activeTab !== 'financial' && activeTab !== 'reports' && activeTab !== 'manual' && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowImportModal(true)}
                  className="bg-white text-slate-600 px-4 py-2 rounded-xl font-medium border border-slate-200 hover:bg-slate-50 transition-all flex items-center space-x-2 shadow-sm"
                >
                  <Upload size={18} />
                  <span>Importar</span>
                </button>
                <button
                  onClick={() => {
                    setModalType(activeTab);
                    setShowModal(true);
                  }}
                  className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200"
                >
                  <Plus size={20} />
                  <span>Novo Registro</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'manual' && (
                <div className="space-y-8 max-w-4xl">
                  <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <BookOpen size={24} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">Manual do Sistema</h3>
                        <p className="text-slate-500">Guia completo de funcionalidades do ImobiGestão.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <ManualSection
                        title="1. Dashboard & Visão Geral"
                        content="O Dashboard oferece uma visão consolidada do seu negócio. Você pode ver o total de proprietários, inquilinos, imóveis ativos e contratos vigentes. Use os cards de estatísticas para monitorar o crescimento da sua imobiliária em tempo real."
                      />
                      <ManualSection
                        title="2. Gestão de Pessoas (Proprietários, Inquilinos e Corretores)"
                        content="Cadastre todos os envolvidos no processo. 
                  - Proprietários: Preencha dados bancários e chave PIX para repasses.
                  - Inquilinos: Mantenha histórico de ocorrências e dados de contato.
                  - Corretores: Cadastre corretores parceiros para gerenciar comissões mensais sobre as locações."
                      />
                      <ManualSection
                        title="3. Gestão de Imóveis e Manutenções"
                        content="Cadastre seus imóveis detalhando características. 
                  - Coproprietários: Defina o percentual de participação.
                  - Documentos: Vincule links de escrituras e documentos digitais.
                  - Manutenções: Registre solicitações de reparos, orçamentos e controle quem pagará pelo serviço."
                      />
                      <ManualSection
                        title="4. Contratos, Vistorias e Uploads"
                        content="O contrato é o centro da operação.
                  - Upload de Arquivos: Agora você pode anexar PDFs de contratos e fotos de vistorias/manutenções diretamente na nuvem (Supabase Storage).
                  - Vistorias: Controle vistorias de check-in e check-out com armazenamento seguro de imagens.
                  - Reajustes: Acompanhe as datas de reajuste anual pelo Dashboard."
                      />
                      <ManualSection
                        title="5. Financeiro & Automação"
                        content="A aba financeira gerencia cobranças e pagamentos.
                  - Geração em Massa: Clique em 'Gerar Mensalidades do Mês' para criar automaticamente as cobranças de todos os contratos ativos.
                  - Repasses: O sistema calcula o valor líquido e permite repasse via Asaas.
                  - Comissões: Cálculo automático de comissões de corretores por pagamento recebido."
                      />
                      <ManualSection
                        title="6. Importação de Dados"
                        content="Não precisa cadastrar um por um! Use a ferramenta de importação (botão 'Importar' no topo das abas) para subir planilhas em Excel (.xlsx) ou CSV com seus dados antigos. Siga o modelo de colunas indicado na tela de importação."
                      />
                      <ManualSection
                        title="7. Notificações WhatsApp"
                        content="Mantenha seus clientes informados. Após realizar um repasse, o sistema oferece a opção de enviar uma mensagem automática via WhatsApp para o proprietário confirmando o pagamento."
                      />

                      <div className="mt-12 pt-8 border-t border-slate-100">
                        <div className="flex items-center space-x-4 mb-6">
                          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                            <Database size={24} />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold">Status do Banco de Dados</h3>
                            <p className="text-slate-500">Verifique se todas as tabelas foram criadas corretamente no Supabase.</p>
                          </div>
                        </div>

                        <button
                          onClick={async () => {
                            try {
                              const res = await fetch('/api/db-check');
                              const data = await res.json();
                              const report = Object.entries(data).map(([table, status]) => `${table}: ${status}`).join('\n');
                              alert(`Relatório de Tabelas:\n\n${report}`);
                            } catch (e) {
                              alert('Erro ao verificar banco de dados.');
                            }
                          }}
                          className="bg-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-200 flex items-center space-x-2"
                        >
                          <RefreshCw size={20} />
                          <span>Verificar Tabelas</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-900 rounded-3xl p-8 text-white shadow-xl shadow-emerald-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold mb-2">Precisa de Ajuda Adicional?</h3>
                        <p className="text-emerald-100 opacity-80 max-w-md">Nossa equipe de suporte está disponível para ajudar você com configurações avançadas ou dúvidas técnicas.</p>
                      </div>
                      <button
                        onClick={() => window.open('https://wa.me/5511999999999', '_blank')}
                        className="bg-white text-emerald-900 px-8 py-4 rounded-2xl font-bold hover:bg-emerald-50 transition-all flex items-center space-x-2"
                      >
                        <HelpCircle size={20} />
                        <span>Falar com Suporte</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'dashboard' && (() => {
                // Calculations based on real data
                const activeContracts = contracts.filter(c => {
                  const diffDays = Math.ceil((new Date(c.end_date).getTime() - Date.now()) / 86400000);
                  return c.status !== 'finalizado' && c.status !== 'suspenso' && diffDays > 0;
                });
                const occupancyRate = properties.length ? Math.round((activeContracts.length / properties.length) * 100) : 0;
                
                const currentMonthPays = payments.filter(p => new Date(p.received_date || p.due_date).getMonth() === new Date().getMonth() && p.status === 'paid');
                const monthlyRevenue = currentMonthPays.reduce((acc, p) => acc + (p.amount_paid || 0), 0);
                
                // For demonstration of variation (+12% like mockup)
                const lastMonthPays = payments.filter(p => {
                  const d = new Date(); d.setMonth(d.getMonth() - 1);
                  return new Date(p.received_date || p.due_date).getMonth() === d.getMonth() && p.status === 'paid';
                });
                const lastMonthRevenue = lastMonthPays.reduce((acc, p) => acc + (p.amount_paid || 0), 0);
                const revenueGrowth = lastMonthRevenue ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 12; // fallback to 12 if no prev data

                const expiringContracts = contracts.filter(c => {
                  const diffDays = Math.ceil((new Date(c.end_date).getTime() - Date.now()) / 86400000);
                  return c.status !== 'finalizado' && diffDays > 0 && diffDays <= 60;
                }).length;

                const newProposals = 2; // Fixed as per mockup for now, or could map to recent tenants

                // Pie Chart Data
                const rented = activeContracts.length;
                const vacant = Math.max(0, properties.length - rented);
                const inMaintenance = maintenances.filter(m => m.status === 'pending').length;
                const totalStatus = rented + vacant + inMaintenance || 1;
                const rentedPct = Math.round((rented / totalStatus) * 100);
                const vacantPct = Math.round((vacant / totalStatus) * 100);
                const maintPct = Math.round((inMaintenance / totalStatus) * 100);

                // Financial Evolution Chart Data
                const last6Months = Array.from({ length: 6 }, (_, i) => {
                  const d = new Date();
                  d.setMonth(d.getMonth() - (5 - i));
                  return { month: d.getMonth(), year: d.getFullYear(), label: d.toLocaleString('pt-BR', { month: 'short' }) };
                });
                const chartData = last6Months.map(({ month, year, label }) => {
                  const monthPays = payments.filter(p => {
                    const d = new Date(p.received_date || p.due_date);
                    return d.getMonth() === month && d.getFullYear() === year;
                  });
                  return {
                    name: label.charAt(0).toUpperCase() + label.slice(1),
                    receita: monthPays.filter(p => p.status === 'paid').reduce((a, p) => a + (p.amount_paid || 0), 0),
                  };
                });

                return (
                  <div className="bg-[#0B1121] -mx-8 -mt-8 p-4 md:p-8 min-h-[calc(100vh-80px)] text-white font-sans animate-in fade-in slide-in-from-bottom-4 duration-500 md:rounded-tl-[2rem]">
                    <div className="max-w-md md:max-w-4xl mx-auto space-y-6">
                      
                      {/* Header */}
                      <div className="mb-6 pt-4">
                        <h2 className="text-3xl font-bold text-white tracking-tight">Dashboard</h2>
                        <p className="text-slate-400 mt-1 text-sm">Visão Geral</p>
                      </div>

                      {/* Row 1 & 2 (Grid 2x2) */}
                      <div className="grid grid-cols-2 gap-4">
                        
                        {/* Card: Ocupação */}
                        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-5 flex flex-col justify-between hover:bg-slate-800/60 transition-colors">
                          <div className="flex justify-between items-center text-slate-300 text-sm mb-4">
                            <span>Ocupação Atual</span>
                            <ChevronRight size={16} className="text-slate-500" />
                          </div>
                          <div className="relative h-24 flex flex-col items-center justify-end mt-2">
                            <svg viewBox="0 0 100 50" className="w-32 absolute top-0 overflow-visible">
                              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#1e293b" strokeWidth="10" strokeLinecap="round" />
                              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#06b6d4" strokeWidth="10" strokeLinecap="round" strokeDasharray="125.6" strokeDashoffset={125.6 * (1 - occupancyRate/100)} className="transition-all duration-1000 ease-out" />
                            </svg>
                            <span className="font-bold text-3xl text-white relative z-10 -mt-2">{occupancyRate}%</span>
                          </div>
                          <div className="text-center text-slate-400 text-xs mt-2 font-medium">Ocupados</div>
                        </div>

                        {/* Card: Receita */}
                        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-5 flex flex-col justify-between hover:bg-slate-800/60 transition-colors">
                          <div className="flex justify-between items-center text-slate-300 text-sm mb-2">
                            <span>Receita Mensal</span>
                            <ChevronRight size={16} className="text-slate-500" />
                          </div>
                          <div className="h-16 w-full -mx-2">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={chartData}>
                                <defs>
                                  <linearGradient id="colorMini" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="receita" stroke="#06b6d4" strokeWidth={2} fill="url(#colorMini)" dot={false} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="mt-1 flex items-baseline gap-2">
                            <span className="font-bold text-lg text-white truncate" title={`R$ ${monthlyRevenue.toLocaleString('pt-BR')}`}>R$ {(monthlyRevenue/1000).toFixed(1)}k</span>
                            <span className={`text-xs ${revenueGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {revenueGrowth > 0 ? '+' : ''}{revenueGrowth}%
                            </span>
                          </div>
                        </div>

                        {/* Card: Contratos */}
                        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-5 flex flex-col justify-between hover:bg-slate-800/60 transition-colors">
                          <div className="flex justify-between items-start text-slate-300 text-sm mb-2">
                            <span className="leading-tight">Contratos<br/>Próximos do Fim</span>
                            <ChevronRight size={16} className="text-slate-500 shrink-0" />
                          </div>
                          <div className="flex justify-between items-end mt-4">
                            <span className="text-3xl font-bold text-white">{expiringContracts}</span>
                            <span className="text-emerald-400 text-xs font-medium cursor-pointer hover:text-emerald-300" onClick={() => { setActiveTab('contracts'); setContractStatusFilter('ativos'); }}>Ver Todos</span>
                          </div>
                        </div>

                        {/* Card: Propostas */}
                        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-5 flex flex-col justify-between hover:bg-slate-800/60 transition-colors">
                          <div className="flex justify-between items-start text-slate-300 text-sm mb-2">
                            <span className="leading-tight">Novas<br/>Propostas</span>
                            <ChevronRight size={16} className="text-slate-500 shrink-0" />
                          </div>
                          <div className="flex justify-between items-end mt-4">
                            <span className="text-3xl font-bold text-white">{newProposals}</span>
                          </div>
                        </div>
                      </div>

                      {/* Evolução Financeira */}
                      <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-5 md:p-6 hover:bg-slate-800/60 transition-colors">
                        <div className="text-slate-300 text-sm mb-6">Evolução Financeira</div>
                        <div className="h-40 md:h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorEvol" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                              <YAxis tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                              <Tooltip formatter={(v) => `R$ ${Number(v).toLocaleString('pt-BR')}`} contentStyle={{ borderRadius: '12px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: 12 }} />
                              <Area type="monotone" dataKey="receita" stroke="#06b6d4" strokeWidth={2.5} fill="url(#colorEvol)" dot={{ r: 3, fill: '#06b6d4', strokeWidth: 0 }} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Status dos Imóveis */}
                      <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-5 md:p-6 hover:bg-slate-800/60 transition-colors">
                        <div className="text-slate-300 text-sm mb-6">Status dos Imóveis</div>
                        <div className="flex flex-row items-center justify-between">
                          <div className="w-1/2 flex justify-center relative">
                            <svg viewBox="0 0 40 40" className="w-24 h-24 md:w-32 md:h-32 transform -rotate-90">
                              <circle cx="20" cy="20" r="16" fill="none" stroke="#475569" strokeWidth="6" />
                              <circle cx="20" cy="20" r="16" fill="none" stroke="#06b6d4" strokeWidth="6" strokeDasharray="100" strokeDashoffset={100 - rentedPct} strokeLinecap="round" className="transition-all duration-1000" />
                              <circle cx="20" cy="20" r="16" fill="none" stroke="#64748b" strokeWidth="6" strokeDasharray="100" strokeDashoffset={100 - maintPct} strokeLinecap="round" className="transform origin-center rotate-[120deg]" />
                            </svg>
                          </div>
                          <div className="w-1/2 space-y-4 pl-4 border-l border-slate-700/50">
                            <div className="flex justify-between items-center text-sm">
                              <span className="flex items-center gap-2 text-slate-300"><div className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]"></div>Alugados</span>
                              <span className="text-slate-400 text-xs">{rentedPct}%</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="flex items-center gap-2 text-slate-300"><div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>Vagos</span>
                              <span className="text-slate-400 text-xs">{vacantPct}%</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="flex items-center gap-2 text-slate-300"><div className="w-2.5 h-2.5 rounded-full bg-slate-500"></div>Manutenção</span>
                              <span className="text-slate-400 text-xs">{maintPct}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pb-8"></div>
                    </div>
                  </div>
                );
              })()}
              {activeTab === 'brokers' && (
                <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-300">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                      <tr>
                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Corretor</th>
                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Contato</th>
                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filterList(brokers).length === 0 ? (
                        <tr><td colSpan={3} className="px-8 py-16 text-center text-slate-400 italic">Nenhum corretor encontrado.</td></tr>
                      ) : filterList(brokers).map(b => (
                        <tr key={b.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-5">
                            <div className="font-black text-slate-700">{b.name}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Doc: {b.document}</div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="text-sm text-slate-600 font-medium">{b.email}</span>
                              <span className="text-xs text-slate-400">{b.phone}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex space-x-2">
                              <button onClick={() => { setEditingItem(b); setModalType('brokers'); setShowModal(true); }} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"><Settings size={18} /></button>
                              <button onClick={() => handleDelete('brokers', b.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'inspections' && (
                <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-300">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                      <tr>
                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Imóvel / Tipo</th>
                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Data / Status</th>
                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filterList(inspections).length === 0 ? (
                        <tr><td colSpan={3} className="px-8 py-16 text-center text-slate-400 italic">Nenhuma vistoria encontrada.</td></tr>
                      ) : filterList(inspections).map(i => (
                        <tr key={i.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-5">
                            <div className="font-black text-slate-700">{i.address}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{i.type}</div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="text-sm font-bold text-slate-600">{formatDate(i.date)}</div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${i.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                              {i.status === 'completed' ? 'Concluída' : 'Pendente'}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex space-x-2">
                              {i.photos_link && <button onClick={() => window.open(i.photos_link, '_blank')} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"><ExternalLink size={18} /></button>}
                              <button onClick={() => { setEditingItem(i); setModalType('inspections'); setShowModal(true); }} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"><Settings size={18} /></button>
                              <button onClick={() => handleDelete('inspections', i.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'maintenances' && (
                <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-300">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                      <tr>
                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Imóvel / Descrição</th>
                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Status / Custo</th>
                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Responsável</th>
                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filterList(maintenances).length === 0 ? (
                        <tr><td colSpan={4} className="px-8 py-16 text-center text-slate-400 italic">Nenhuma manutenção encontrada.</td></tr>
                      ) : filterList(maintenances).map(m => (
                        <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-5">
                            <div className="font-black text-slate-700">{m.address}</div>
                            <div className="text-xs text-slate-400 font-medium truncate max-w-[200px]">{m.description}</div>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${
                              m.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                              m.status === 'approved' ? 'bg-blue-100 text-blue-600' :
                              m.status === 'rejected' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                            }`}>
                              {m.status === 'completed' ? 'Concluído' : m.status === 'approved' ? 'Aprovado' : m.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                            </span>
                            <div className="text-sm font-black text-slate-600 mt-1">R$ {m.estimated_cost.toLocaleString('pt-BR')}</div>
                          </td>
                          <td className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">{m.paid_by || '-'}</td>
                          <td className="px-8 py-5">
                            <div className="flex space-x-2">
                              <button onClick={() => { setEditingItem(m); setModalType('maintenances'); setShowModal(true); }} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"><Settings size={18} /></button>
                              <button onClick={() => handleDelete('maintenances', m.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'owners' && (
                <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-300">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                      <tr>
                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Proprietário</th>
                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Contato</th>
                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Documento</th>
                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filterList(owners).length === 0 ? (
                        <tr><td colSpan={4} className="px-8 py-16 text-center text-slate-400 italic">Nenhum proprietário encontrado.</td></tr>
                      ) : filterList(owners).map(o => (
                        <tr key={o.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-5">
                            <div className="font-black text-slate-700">{o.name}</div>
                            <div className="text-xs text-slate-400 font-bold">ID: {o.id.toString().slice(0, 8)}</div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="text-sm text-slate-600 font-medium">{o.email}</span>
                              <span className="text-xs text-slate-400">{o.phone}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-sm text-slate-500 font-medium">{o.document}</td>
                          <td className="px-8 py-5">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => { setEditingItem(o); setModalType('owners'); setShowModal(true); }}
                                className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                                title="Editar"
                              >
                                <Settings size={18} />
                              </button>
                              <button 
                                onClick={() => handleDelete('owners', o.id)}
                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                title="Excluir"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'tenants' && (
                <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-300">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                      <tr>
                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Inquilino</th>
                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Contato</th>
                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Status Asaas</th>
                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filterList(tenants).length === 0 ? (
                        <tr><td colSpan={4} className="px-8 py-16 text-center text-slate-400 italic">Nenhum inquilino encontrado.</td></tr>
                      ) : filterList(tenants).map(t => (
                        <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-5">
                            <div className="font-black text-slate-700">{t.name}</div>
                            <div className="text-xs text-slate-400 font-bold">{t.document}</div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="text-sm text-slate-600 font-medium">{t.email}</span>
                              <span className="text-xs text-slate-400">{t.phone}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <button 
                              onClick={() => handleAsaasSync(t.id)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${(t as any).asaas_id ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                            >
                              <Zap size={14} fill={(t as any).asaas_id ? 'currentColor' : 'none'} />
                              {(t as any).asaas_id ? 'CONECTADO' : 'SINCRONIZAR'}
                            </button>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => {
                                  setSearchTerm(t.name);
                                  setIgnoreDateFilter(true);
                                  setActiveTab('financial');
                                  setShowFinancialFilters(true);
                                }}
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                                title="Ver histórico completo de cobranças deste inquilino"
                              >
                                <List size={18} />
                              </button>
                              <button onClick={() => { setEditingItem(t); setModalType('tenants'); setShowModal(true); }} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"><Settings size={18} /></button>
                              <button onClick={() => handleDelete('tenants', t.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'properties' && (
                <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-300">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                      <tr>
                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Imóvel</th>
                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Características</th>
                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Proprietário</th>
                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filterList(properties).length === 0 ? (
                        <tr><td colSpan={4} className="px-8 py-16 text-center text-slate-400 italic">Nenhum imóvel encontrado.</td></tr>
                      ) : filterList(properties).map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-5">
                            <div className="font-black text-slate-700">{p.address}</div>
                            <div className="flex gap-2 mt-1">
                              <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-black uppercase tracking-tighter">{p.type}</span>
                              <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-black uppercase tracking-tighter">{p.usage_type}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4 text-slate-400">
                              <div className="flex items-center gap-1"><span className="text-sm font-black text-slate-600">{p.rooms}</span> <span className="text-[10px] font-bold uppercase">Q</span></div>
                              <div className="flex items-center gap-1"><span className="text-sm font-black text-slate-600">{p.bathrooms}</span> <span className="text-[10px] font-bold uppercase">B</span></div>
                              <div className="flex items-center gap-1"><span className="text-sm font-black text-slate-600">{p.size}</span> <span className="text-[10px] font-bold uppercase">m²</span></div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="text-sm font-bold text-slate-600">{p.owner_name}</div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex space-x-2">
                              <button onClick={() => { setEditingItem(p); setModalType('properties'); setSecondaryOwners(p.secondary_owners || []); setShowModal(true); }} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"><Settings size={18} /></button>
                              <button onClick={() => handleDelete('properties', p.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'contracts' && (() => {
                const filteredContracts = filterList(contracts).filter(c => {
                  const diffDays = Math.ceil((new Date(c.end_date).getTime() - Date.now()) / 86400000);
                  const isExpired = diffDays <= 0;
                  if (c.status === 'finalizado' || c.status === 'suspenso') {
                    return contractStatusFilter === 'finalizados';
                  }
                  if (contractStatusFilter === 'ativos') {
                    return !isExpired;
                  }
                  if (contractStatusFilter === 'vencidos') {
                    return isExpired;
                  }
                  return true;
                });
                return (
                  <div className="space-y-4">
                    {/* Filtro de Status de Contratos */}
                    <div className="flex gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm w-fit">
                      {(['todos', 'ativos', 'vencidos', 'finalizados'] as const).map((statusFilter) => (
                        <button
                          key={statusFilter}
                          onClick={() => setContractStatusFilter(statusFilter)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                            contractStatusFilter === statusFilter
                              ? 'bg-slate-800 text-white'
                              : 'text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {statusFilter === 'todos' ? 'Todos'
                            : statusFilter === 'ativos' ? 'Ativos'
                            : statusFilter === 'vencidos' ? 'Vencidos'
                            : 'Finalizados'}
                        </button>
                      ))}
                    </div>

                    <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-300">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                          <tr>
                            <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Contrato / Imóvel</th>
                            <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Inquilino</th>
                            <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Financeiro</th>
                            <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Vigência</th>
                            <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {filteredContracts.length === 0 ? (
                            <tr><td colSpan={5} className="px-8 py-16 text-center text-slate-400 italic">Nenhum contrato encontrado.</td></tr>
                          ) : filteredContracts.map(c => {
                            const extras = c.extra_charges ? JSON.parse(c.extra_charges) : [];
                            return (
                              <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-8 py-5">
                                  <div className="font-black text-slate-700">{c.address}</div>
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">ID: {c.id}</div>
                                </td>
                                <td className="px-8 py-5">
                                  <div className="text-sm font-bold text-slate-600">{c.tenant_name}</div>
                                </td>
                                <td className="px-8 py-5">
                                  <div className="font-black text-emerald-600">R$ {c.rent_value.toLocaleString('pt-BR')}</div>
                                  <div className="flex gap-1 mt-1">
                                    <div className={`w-2 h-2 rounded-full ${c.iptu_status === 'paid' ? 'bg-emerald-400' : 'bg-slate-200'}`} title="IPTU" />
                                    <div className={`w-2 h-2 rounded-full ${c.condo_status === 'paid' ? 'bg-emerald-400' : 'bg-slate-200'}`} title="Condomínio" />
                                  </div>
                                </td>
                                <td className="px-8 py-5">
                                  <div className="text-xs font-bold text-slate-500">{formatDate(c.start_date)} - {formatDate(c.end_date)}</div>
                                  {(() => {
                                    if (c.status === 'finalizado') {
                                      return <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 mt-1"><CheckCircle2 size={9} /> FINALIZADO</span>;
                                    }
                                    if (c.status === 'suspenso') {
                                      return <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 mt-1"><AlertCircle size={9} /> SUSPENSO</span>;
                                    }
                                    const diffDays = Math.ceil((new Date(c.end_date).getTime() - Date.now()) / 86400000);
                                    return diffDays <= 0
                                      ? <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 mt-1"><AlertCircle size={9} /> VENCIDO</span>
                                      : diffDays <= 60
                                      ? <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 mt-1"><Clock size={9} /> {diffDays}d restantes</span>
                                      : <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 mt-1"><CheckCircle2 size={9} /> ATIVO</span>;
                                  })()}
                                </td>
                                <td className="px-8 py-5">
                                  <div className="flex space-x-2">
                                    <button onClick={() => { setEditingItem(c); setModalType('contracts'); setExtraCharges(extras); setShowModal(true); }} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all" title="Editar Contrato"><Settings size={18} /></button>
                                    <button onClick={() => handleDelete('contracts', c.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all" title="Excluir Contrato"><Trash2 size={18} /></button>
                                    <button
                                      onClick={() => {
                                        setRenewingContract(c);
                                        setShowRenewModal(true);
                                      }}
                                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                      title="Renovar Contrato"
                                    >
                                      <RefreshCw size={18} />
                                    </button>
                                    {!(c as any).asaas_subscription_id ? (
                                      <button onClick={() => handleAsaasSubscription(c.id)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all" title="Criar Assinatura Asaas"><Zap size={18} /></button>
                                    ) : (
                                      <button onClick={() => handleCheckSubscription(c.id)} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all" title="Verificar Assinatura"><CheckCircle2 size={18} /></button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}

              {activeTab === 'financial' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-3xl font-black text-slate-800 tracking-tight">Situação das cobranças</h2>
                      <p className="text-slate-500 font-medium">Gestão financeira em tempo real</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                        <button className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold flex items-center gap-2">
                          <Calendar size={16} />
                          Este mês
                        </button>
                        <button 
                          onClick={() => setShowFinancialFilters(!showFinancialFilters)}
                          className={`px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${showFinancialFilters ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                          <Filter size={16} />
                          Filtros
                        </button>
                      </div>
                      <button
                        onClick={handleGeneratePayments}
                        className="flex items-center space-x-2 bg-emerald-500 text-white px-6 py-2.5 rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 font-bold active:scale-95"
                      >
                        <Zap size={18} />
                        <span>Gerar Mensalidades</span>
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {showFinancialFilters && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-wrap gap-4 items-end">
                          <div className="flex-1 min-w-[200px] space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Buscar Inquilino ou Imóvel</label>
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                              <input 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Nome, endereço..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Início</label>
                            <input 
                              type="date"
                              value={reportStartDate}
                              onChange={(e) => setReportStartDate(e.target.value)}
                              disabled={ignoreDateFilter}
                              className={`px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium ${ignoreDateFilter ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fim</label>
                            <input 
                              type="date"
                              value={reportEndDate}
                              onChange={(e) => setReportEndDate(e.target.value)}
                              disabled={ignoreDateFilter}
                              className={`px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium ${ignoreDateFilter ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <input 
                              type="checkbox"
                              id="ignoreDateFilter"
                              checked={ignoreDateFilter}
                              onChange={(e) => setIgnoreDateFilter(e.target.checked)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            />
                            <label htmlFor="ignoreDateFilter" className="text-xs font-bold text-slate-500 cursor-pointer select-none">
                              Ignorar período (Histórico Completo)
                            </label>
                          </div>
                          <button 
                            onClick={() => { setSearchTerm(''); setPaymentFilterStatus(null); setIgnoreDateFilter(false); }}
                            className="px-4 py-2 text-rose-500 font-bold text-sm hover:bg-rose-50 rounded-xl transition-colors"
                          >
                            Limpar
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Dashboard Grid similar ao Asaas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Recebidas */}
                    <FinancialCard 
                      title="Recebidas"
                      value={filteredPayments.filter(p => p.status === 'paid').reduce((acc, curr) => acc + (curr.amount_paid || 0), 0)}
                      liquidValue={filteredPayments.filter(p => p.status === 'paid').reduce((acc, curr) => acc + (curr.transfer_amount || 0), 0)}
                      clients={new Set(filteredPayments.filter(p => p.status === 'paid').map(p => p.tenant_name)).size}
                      charges={filteredPayments.filter(p => p.status === 'paid').length}
                      color="emerald"
                      progress={100}
                      isActive={paymentFilterStatus === 'paid'}
                      onClick={() => setPaymentFilterStatus(paymentFilterStatus === 'paid' ? null : 'paid')}
                    />
                    
                    {/* Confirmadas (Recentemente pagas no cartão/pix) */}
                    <FinancialCard 
                      title="Confirmadas"
                      value={filteredPayments.filter(p => p.asaas_status === 'CONFIRMED').reduce((acc, curr) => acc + (curr.amount_paid || 0), 0)}
                      liquidValue={filteredPayments.filter(p => p.asaas_status === 'CONFIRMED').reduce((acc, curr) => acc + (curr.transfer_amount || 0), 0)}
                      clients={new Set(filteredPayments.filter(p => p.asaas_status === 'CONFIRMED').map(p => p.tenant_name)).size}
                      charges={filteredPayments.filter(p => p.asaas_status === 'CONFIRMED').length}
                      color="blue"
                      progress={0}
                      isActive={paymentFilterStatus === 'CONFIRMED'}
                      onClick={() => setPaymentFilterStatus(paymentFilterStatus === 'CONFIRMED' ? null : 'CONFIRMED')}
                    />

                    {/* Aguardando pagamento */}
                    <FinancialCard 
                      title="Aguardando pagamento"
                      value={filteredPayments.filter(p => p.status === 'pending' && new Date(p.due_date) >= new Date()).reduce((acc, curr) => {
                        const contract = contracts.find(c => c.id === curr.contract_id);
                        return acc + (contract?.rent_value || 0) + (contract?.charges || 0);
                      }, 0)}
                      liquidValue={0}
                      clients={new Set(filteredPayments.filter(p => p.status === 'pending' && new Date(p.due_date) >= new Date()).map(p => p.tenant_name)).size}
                      charges={filteredPayments.filter(p => p.status === 'pending' && new Date(p.due_date) >= new Date()).length}
                      color="amber"
                      progress={0}
                      isActive={paymentFilterStatus === 'pending'}
                      onClick={() => setPaymentFilterStatus(paymentFilterStatus === 'pending' ? null : 'pending')}
                    />

                    {/* Vencidas */}
                    <FinancialCard 
                      title="Vencidas"
                      value={filteredPayments.filter(p => p.status === 'pending' && new Date(p.due_date) < new Date()).reduce((acc, curr) => {
                        const contract = contracts.find(c => c.id === curr.contract_id);
                        return acc + (contract?.rent_value || 0) + (contract?.charges || 0);
                      }, 0)}
                      liquidValue={0}
                      clients={new Set(filteredPayments.filter(p => p.status === 'pending' && new Date(p.due_date) < new Date()).map(p => p.tenant_name)).size}
                      charges={filteredPayments.filter(p => p.status === 'pending' && new Date(p.due_date) < new Date()).length}
                      color="red"
                      progress={0}
                      isActive={paymentFilterStatus === 'overdue'}
                      onClick={() => setPaymentFilterStatus(paymentFilterStatus === 'overdue' ? null : 'overdue')}
                    />
                  </div>

                  <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <List size={18} className="text-blue-500" />
                        Detalhamento das Cobranças
                      </h3>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mês Vigente</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50/50">
                          <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Inquilino</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Vencimento</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Status Asaas</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Valor</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {displayedPayments.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                                Nenhuma fatura encontrada com estes filtros.
                              </td>
                            </tr>
                          ) : (
                            displayedPayments.map(p => (
                              <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                                <td className="px-6 py-4">
                                  <div className="font-bold text-slate-700">{p.tenant_name}</div>
                                  <div className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">{p.address}</div>
                                </td>
                                <td className="px-6 py-4 text-slate-600 font-medium">{formatDate(p.due_date)}</td>
                                <td className="px-6 py-4">
                                  {p.asaas_status ? (
                                    <span className="text-[10px] font-black px-2 py-1 bg-slate-100 text-slate-500 rounded-md">
                                      {p.asaas_status}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-300 italic">Não vinculado</span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="font-black text-slate-700">R$ {(p.amount_paid || contracts.find(c => c.id === p.contract_id)?.rent_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <StatusBadge status={p.status} />
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {(p.asaas_id || (contracts.find(c => c.id === p.contract_id) as any)?.asaas_subscription_id) && (
                                      <button
                                        onClick={() => handleAsaasCheck(p.id)}
                                        className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                                        title="Conferir status no Asaas"
                                      >
                                        <RefreshCw size={16} />
                                      </button>
                                    )}
                                    {p.status === 'pending' && (
                                      <button
                                        onClick={() => handleAsaasPayment(p.id)}
                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Gerar no Asaas"
                                      >
                                        <ExternalLink size={16} />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => {
                                        setSelectedPayment(p);
                                        setDebtsValue(p.debts_value || 0);
                                        setExtraPayments(p.extra_payments ? JSON.parse(p.extra_payments) : []);
                                        setShowPaymentModal(true);
                                      }}
                                      className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                                    >
                                      <Settings size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'repasse' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-center flex-wrap gap-4">
                    <div>
                      <h2 className="text-3xl font-black text-slate-800 tracking-tight">Gestão de Repasses</h2>
                      <p className="text-slate-500 font-medium">Controle de pagamentos aos proprietários</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filtrar por Proprietário</label>
                      <select
                        value={repasseOwnerFilter}
                        onChange={(e) => setRepasseOwnerFilter(e.target.value)}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-sm"
                      >
                        <option value="">Todos os proprietários</option>
                        {owners.map(o => (
                          <option key={o.id} value={String(o.id)}>{o.name}</option>
                        ))}
                      </select>
                      {repasseOwnerFilter && (
                        <button onClick={() => setRepasseOwnerFilter('')} className="text-xs text-rose-500 font-bold hover:text-rose-600">Limpar</button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                      <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-slate-800">
                        <Clock size={20} className="text-amber-500" />
                        Repasses Pendentes
                      </h3>
                      <div className="space-y-4">
                        {payments.filter(p => p.status === 'paid' && p.transfer_status !== 'done').length === 0 ? (
                          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <CheckCircle2 size={32} className="mx-auto text-emerald-300 mb-2" />
                            <p className="text-slate-400 font-bold">Nenhum repasse pendente!</p>
                          </div>
                        ) : (
                          payments.filter(p => {
                            if (p.status !== 'paid' || p.transfer_status === 'done') return false;
                            if (!repasseOwnerFilter) return true;
                            const prop = properties.find(pr => pr.id === contracts.find(c => c.id === p.contract_id)?.property_id);
                            return prop && String(prop.owner_id) === repasseOwnerFilter;
                          }).map(p => (
                            <div key={p.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center group hover:border-blue-200 transition-all">
                              <div>
                                <p className="font-black text-slate-700">{p.owner_name || 'Proprietário'}</p>
                                <p className="text-xs text-slate-500 font-medium">{p.address}</p>
                                <div className="flex gap-2 mt-1">
                                  <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">Ref: {formatDate(p.due_date)}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-black text-blue-600">R$ {(p.transfer_amount || 0).toLocaleString('pt-BR')}</p>
                                <button 
                                  onClick={() => { setSelectedPayment(p); setShowRepasseDetailModal(true); }}
                                  className="mt-2 text-[10px] font-black text-white bg-blue-500 px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-all shadow-sm shadow-blue-100"
                                >
                                  REALIZAR REPASSE
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                      <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-slate-800">
                        <CheckCircle2 size={20} className="text-emerald-500" />
                        Últimos Repasses Realizados
                      </h3>
                      <div className="space-y-4">
                        {payments.filter(p => {
                            if (p.transfer_status !== 'done') return false;
                            if (!repasseOwnerFilter) return true;
                            const prop = properties.find(pr => pr.id === contracts.find(c => c.id === p.contract_id)?.property_id);
                            return prop && String(prop.owner_id) === repasseOwnerFilter;
                          }).length === 0 ? (
                          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-slate-400 font-bold italic">Nenhum histórico encontrado.</p>
                          </div>
                        ) : (
                          payments.filter(p => {
                            if (p.transfer_status !== 'done') return false;
                            if (!repasseOwnerFilter) return true;
                            const prop = properties.find(pr => pr.id === contracts.find(c => c.id === p.contract_id)?.property_id);
                            return prop && String(prop.owner_id) === repasseOwnerFilter;
                          }).slice(0, 5).map(p => (
                            <div key={p.id} className="p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100/50 flex justify-between items-center">
                              <div>
                                <p className="font-black text-slate-700">{p.owner_name || 'Proprietário'}</p>
                                <p className="text-xs text-slate-500 font-medium">{p.address}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-black text-emerald-600">R$ {(p.transfer_amount || 0).toLocaleString('pt-BR')}</p>
                                <p className="text-[9px] font-black text-emerald-400 uppercase">Enviado em {formatDate(p.received_date || '')}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reports' && (
                <div className="space-y-6">
                  {/* Filtros de Período */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col md:flex-row md:items-end gap-4 print:hidden">
                    <div className="flex-1 space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center space-x-2">
                        <Calendar size={16} className="text-emerald-500" />
                        <span>Período do Relatório</span>
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="date"
                          value={reportStartDate}
                          onChange={(e) => setReportStartDate(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium"
                        />
                        <input
                          type="date"
                          value={reportEndDate}
                          onChange={(e) => setReportEndDate(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
                          const end = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];
                          setReportStartDate(start);
                          setReportEndDate(end);
                        }}
                        className="px-4 py-2 text-slate-500 hover:text-emerald-600 font-bold text-sm"
                      >
                        Este Mês
                      </button>
                      <button
                        onClick={() => handlePrint('all')}
                        className="bg-slate-900 text-white px-6 py-2 rounded-xl hover:bg-slate-800 transition-all shadow-lg flex items-center space-x-2 font-bold"
                      >
                        <Printer size={18} />
                        <span>Imprimir Tudo</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:hidden">
                    <ReportCard
                      title="Repasses Pendentes"
                      desc="Lista de valores recebidos aguardando transferência para proprietários."
                      onClick={() => setShowRepasseModal(true)}
                    />
                    <ReportCard
                      title="Relatório Financeiro"
                      desc="Resumo de recebimentos, repasses e pendências no período selecionado."
                      onClick={() => {
                        const el = document.getElementById('report-financial-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    />
                    <ReportCard
                      title="Relatório de Contratos"
                      desc="Lista de contratos ativos, vencimentos e reajustes."
                      onClick={() => {
                        const el = document.getElementById('report-contracts-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    />
                  </div>

                  <div className="bg-white p-8 rounded-3xl border border-slate-200 print:border-none print:p-0 shadow-sm overflow-hidden min-h-[500px]">
                    <div className="flex justify-between items-center mb-8 print:hidden">
                      <h3 className="text-xl font-bold flex items-center space-x-2">
                        <BarChart3 size={24} className="text-emerald-500" />
                        <span>Visualização do Relatório</span>
                      </h3>
                      <div className="text-sm text-slate-400 font-medium italic">
                        Período: {formatDate(reportStartDate)} até {formatDate(reportEndDate)}
                      </div>
                    </div>

                    <div id="report-content" className={`space-y-12 ${
                      printType === 'financial' ? 'print-financial-only' : 
                      printType === 'contracts' ? 'print-contracts-only' : 
                      printType === 'details' ? 'print-details-only' : ''
                    }`}>
                      <div className="report-header text-center border-b border-slate-100 pb-8">
                        <h2 className="text-3xl font-bold text-emerald-600 mb-2">ImobiGestão - Relatório Gerencial</h2>
                        <div className="flex flex-col items-center space-y-1">
                          <p className="text-slate-700 font-bold">Período: {formatDate(reportStartDate)} a {formatDate(reportEndDate)}</p>
                          <p className="text-slate-400 text-xs">Gerado em: {new Date().toLocaleString('pt-BR')}</p>
                        </div>
                      </div>

                      <section id="report-financial-section" className="space-y-6">
                        <div className="flex justify-between items-center border-l-4 border-emerald-500 pl-4 py-1">
                          <h4 className="text-lg font-bold text-slate-800">Resumo Financeiro no Período</h4>
                          <button 
                            onClick={() => handlePrint('financial')}
                            className="text-slate-400 hover:text-emerald-600 print:hidden transition-colors"
                            title="Imprimir Resumo Financeiro"
                          >
                            <Printer size={16} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                            <p className="text-xs text-emerald-600 uppercase font-bold mb-2">Total Recebido</p>
                            <p className="text-2xl font-black text-emerald-700">R$ {filteredPayments.filter(p => p.status === 'paid').reduce((acc, curr) => acc + (curr.amount_paid || 0), 0).toLocaleString('pt-BR')}</p>
                            <p className="text-[10px] text-emerald-600 mt-1">{filteredPayments.filter(p => p.status === 'paid').length} cobranças baixadas</p>
                          </div>
                          <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                            <p className="text-xs text-blue-600 uppercase font-bold mb-2">Total Repassado</p>
                            <p className="text-2xl font-black text-blue-700">R$ {filteredPayments.filter(p => p.status === 'paid' && p.transfer_status === 'done').reduce((acc, curr) => acc + (curr.transfer_amount || 0), 0).toLocaleString('pt-BR')}</p>
                            <p className="text-[10px] text-blue-600 mt-1">{filteredPayments.filter(p => p.status === 'paid' && p.transfer_status === 'done').length} repasses confirmados</p>
                          </div>
                          <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100">
                            <p className="text-xs text-orange-600 uppercase font-bold mb-2">Pendências Geradas</p>
                            <p className="text-2xl font-black text-orange-700">R$ {filteredPayments.filter(p => p.status === 'pending').reduce((acc, curr) => {
                              const contract = contracts.find(c => c.id === curr.contract_id);
                              return acc + (contract?.rent_value || 0) + (contract?.charges || 0);
                            }, 0).toLocaleString('pt-BR')}</p>
                            <p className="text-[10px] text-orange-600 mt-1">{filteredPayments.filter(p => p.status === 'pending').length} cobranças em aberto</p>
                          </div>
                        </div>
                      </section>

                      <section id="report-contracts-section" className="space-y-6">
                        <div className="flex justify-between items-center border-l-4 border-emerald-500 pl-4 py-1">
                          <h4 className="text-lg font-bold text-slate-800">Contratações e Ocupação</h4>
                          <button 
                            onClick={() => handlePrint('contracts')}
                            className="text-slate-400 hover:text-emerald-600 print:hidden transition-colors"
                            title="Imprimir Relatório de Contratos"
                          >
                            <Printer size={16} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-white p-6 rounded-2xl border border-slate-100">
                            <p className="text-sm text-slate-500 mb-2">Taxa de Ocupação</p>
                            <div className="flex items-end space-x-2">
                              <span className="text-3xl font-black text-slate-800">{Math.round((contracts.length / (properties.length || 1)) * 100)}%</span>
                              <span className="text-sm text-slate-400 mb-1">({contracts.length} de {properties.length} imóveis)</span>
                            </div>
                          </div>
                          <div className="bg-white p-6 rounded-2xl border border-slate-100">
                            <p className="text-sm text-slate-500 mb-2">Comissão Agência Projetada</p>
                            <div className="flex items-end space-x-2">
                              <span className="text-3xl font-black text-slate-800">R$ {filteredPayments.filter(p => p.status === 'paid').reduce((acc, curr) => acc + (curr.commission_value || 0), 0).toLocaleString('pt-BR')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead>
                              <tr className="bg-slate-50 border-y border-slate-100">
                                <th className="px-4 py-3 font-bold text-slate-600">Endereço</th>
                                <th className="px-4 py-3 font-bold text-slate-600">Tipo</th>
                                <th className="px-4 py-3 font-bold text-slate-600">Proprietário</th>
                                <th className="px-4 py-3 font-bold text-slate-600">Ocupação</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {properties.map(p => {
                                const isOccupied = contracts.some(c => c.property_id === p.id);
                                return (
                                  <tr key={p.id} className="hover:bg-slate-50/50">
                                    <td className="px-4 py-3 font-medium">{p.address}</td>
                                    <td className="px-4 py-3 text-slate-500">{p.type}</td>
                                    <td className="px-4 py-3 text-slate-500">{p.owner_name}</td>
                                    <td className="px-4 py-3">
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isOccupied ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {isOccupied ? 'ALUGADO' : 'DISPONÍVEL'}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </section>

                      <section id="report-details-section" className="space-y-6">
                        <div className="flex justify-between items-center border-l-4 border-emerald-500 pl-4 py-1">
                          <h4 className="text-lg font-bold text-slate-800">Detalhamento Financeiro do Período</h4>
                          <button 
                            onClick={() => handlePrint('details')}
                            className="text-slate-400 hover:text-emerald-600 print:hidden transition-colors"
                            title="Imprimir Detalhamento Financeiro"
                          >
                            <Printer size={16} />
                          </button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead>
                              <tr className="bg-slate-50 border-y border-slate-100">
                                <th className="px-4 py-3 font-bold text-slate-600">Inquilino</th>
                                <th className="px-4 py-3 font-bold text-slate-600">Vencimento</th>
                                <th className="px-4 py-3 font-bold text-slate-600">Valor Bruto</th>
                                <th className="px-4 py-3 font-bold text-slate-600">Status</th>
                                <th className="px-4 py-3 font-bold text-slate-600">Repasse</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {filteredPayments.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">Nenhum lançamento encontrado para este período.</td>
                                </tr>
                              ) : (
                                filteredPayments.map(p => (
                                  <tr key={p.id}>
                                    <td className="px-4 py-3 font-medium">{p.tenant_name}</td>
                                    <td className="px-4 py-3 text-slate-500">{formatDate(p.due_date)}</td>
                                    <td className="px-4 py-3 font-bold">R$ {(p.amount_paid || 0).toLocaleString('pt-BR')}</td>
                                    <td className="px-4 py-3">
                                      <span className={`font-bold text-[10px] ${p.status === 'paid' ? 'text-emerald-600' : 'text-orange-500'}`}>
                                        {p.status === 'paid' ? 'RECEBIDO' : 'PENDENTE'}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3">
                                      {p.status === 'paid' ? (
                                        <div className="flex flex-col">
                                          <span className="font-bold text-blue-600">R$ {(p.transfer_amount || 0).toLocaleString('pt-BR')}</span>
                                          <span className="text-[9px] uppercase font-bold text-slate-400">{p.transfer_status === 'done' ? 'Enviado' : 'Aguardando'}</span>
                                        </div>
                                      ) : '-'}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </section>

                      {/* Relatório por Proprietário */}
                      <section id="report-owner-section" className="space-y-6">
                        <div className="flex justify-between items-center border-l-4 border-blue-500 pl-4 py-1">
                          <h4 className="text-lg font-bold text-slate-800">Extrato por Proprietário</h4>
                          <button
                            onClick={() => handlePrint('all')}
                            className="text-slate-400 hover:text-blue-600 print:hidden transition-colors"
                            title="Imprimir Extrato de Proprietários"
                          >
                            <Printer size={16} />
                          </button>
                        </div>
                        <div className="space-y-4">
                          {owners.map(owner => {
                            const ownerProps = properties.filter(p => p.owner_id === owner.id);
                            const ownerContracts = contracts.filter(c => ownerProps.some(p => p.id === c.property_id));
                            const ownerPayments = filteredPayments.filter(pay => ownerContracts.some(c => c.id === pay.contract_id));
                            const totalReceived = ownerPayments.filter(p => p.status === 'paid').reduce((a, p) => a + (p.amount_paid || 0), 0);
                            const totalTransferred = ownerPayments.filter(p => p.transfer_status === 'done').reduce((a, p) => a + (p.transfer_amount || 0), 0);
                            const pendingTransfer = ownerPayments.filter(p => p.status === 'paid' && p.transfer_status !== 'done').reduce((a, p) => a + (p.transfer_amount || 0), 0);
                            if (ownerContracts.length === 0) return null;
                            return (
                              <div key={owner.id} className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                                <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-slate-100">
                                  <div>
                                    <p className="font-black text-slate-800">{owner.name}</p>
                                    <p className="text-xs text-slate-400">{ownerProps.length} imóvel(is) · {ownerContracts.length} contrato(s)</p>
                                  </div>
                                  <div className="flex gap-6 text-right">
                                    <div>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase">Recebido</p>
                                      <p className="font-black text-emerald-600">R$ {totalReceived.toLocaleString('pt-BR', {minimumFractionDigits:2})}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase">Repassado</p>
                                      <p className="font-black text-blue-600">R$ {totalTransferred.toLocaleString('pt-BR', {minimumFractionDigits:2})}</p>
                                    </div>
                                    {pendingTransfer > 0 && (
                                      <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">A Repassar</p>
                                        <p className="font-black text-amber-600">R$ {pendingTransfer.toLocaleString('pt-BR', {minimumFractionDigits:2})}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="text-left">
                                      <th className="px-6 py-2 font-bold text-slate-400 uppercase">Imóvel</th>
                                      <th className="px-6 py-2 font-bold text-slate-400 uppercase">Vencimento</th>
                                      <th className="px-6 py-2 font-bold text-slate-400 uppercase">Pago em</th>
                                      <th className="px-6 py-2 font-bold text-slate-400 uppercase">Valor</th>
                                      <th className="px-6 py-2 font-bold text-slate-400 uppercase">Repasse</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {ownerPayments.map(p => (
                                      <tr key={p.id} className="hover:bg-white transition-colors">
                                        <td className="px-6 py-2 font-medium text-slate-600 truncate max-w-[200px]">{p.address || '-'}</td>
                                        <td className="px-6 py-2 text-slate-500">{formatDate(p.due_date)}</td>
                                        <td className="px-6 py-2 text-slate-500">{p.received_date ? formatDate(p.received_date) : '-'}</td>
                                        <td className="px-6 py-2 font-bold text-slate-700">R$ {(p.amount_paid || 0).toLocaleString('pt-BR', {minimumFractionDigits:2})}</td>
                                        <td className="px-6 py-2">
                                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                            p.transfer_status === 'done' ? 'bg-blue-100 text-blue-700' :
                                            p.status === 'paid' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                                          }`}>
                                            {p.transfer_status === 'done' ? 'Enviado' : p.status === 'paid' ? 'Pendente' : 'Aguardando'}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                    {ownerPayments.length === 0 && (
                                      <tr><td colSpan={5} className="px-6 py-4 text-center text-slate-400 italic">Nenhum lançamento no período.</td></tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            );
                          })}
                        </div>
                      </section>

                      <div className="pt-8 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest no-print">
                        <span>Fim do Relatório Gerencial</span>
                        <span>{window.location.hostname}</span>
                      </div>
                    </div>
                  </div>

                  {/* Segurança e Backup (Abaixo do relatório na tela) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
                    <div className="bg-white p-8 rounded-3xl border border-slate-200">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                          <ShieldCheck size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Backup e Segurança</h3>
                          <p className="text-slate-500 text-sm">Proteja seus dados contra perdas.</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                          <div>
                            <p className="font-bold text-slate-800">Backup Automático Diário</p>
                            <p className="text-xs text-slate-500">Baixa o banco de dados automaticamente a cada 24h.</p>
                          </div>
                          <button
                            onClick={() => {
                              const enabled = localStorage.getItem('imobi_auto_backup') === 'true';
                              localStorage.setItem('imobi_auto_backup', (!enabled).toString());
                              fetchData();
                            }}
                            className={`w-12 h-6 rounded-full transition-colors relative ${localStorage.getItem('imobi_auto_backup') === 'true' ? 'bg-emerald-500' : 'bg-slate-300'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${localStorage.getItem('imobi_auto_backup') === 'true' ? 'left-7' : 'left-1'}`}></div>
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <button onClick={triggerBackup} className="flex items-center justify-center space-x-2 bg-slate-900 text-white p-4 rounded-2xl hover:bg-slate-800 transition-all">
                            <Download size={20} />
                            <span className="font-bold">Baixar .DB</span>
                          </button>
                          <button onClick={() => {
                            const data = { owners, tenants, properties, contracts, payments };
                            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a'); a.href = url; a.download = `backup_completo_${new Date().toISOString().split('T')[0]}.json`; a.click();
                          }} className="flex items-center justify-center space-x-2 bg-white border border-slate-200 text-slate-700 p-4 rounded-2xl hover:bg-slate-50 transition-all">
                            <RefreshCw size={20} />
                            <span className="font-bold">Exportar JSON</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-emerald-900 text-white p-8 rounded-3xl relative overflow-hidden">
                      <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-2">Dica de Automação</h3>
                        <p className="text-emerald-100 text-sm leading-relaxed mb-6">
                          Configure um script diário para backup automático usando nossa API.
                        </p>
                        <div className="bg-black/20 p-4 rounded-xl font-mono text-[10px] text-emerald-200 break-all">
                          curl -o backup.db {window.location.origin}/api/backup/download
                        </div>
                      </div>
                      <div className="absolute -right-10 -bottom-10 opacity-10">
                        <ShieldCheck size={200} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
            </main>
      {/* Mobile navigation */}
      <MobileNav />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`px-6 py-3 rounded-2xl shadow-xl flex items-center space-x-3 text-white font-bold backdrop-blur-md ${toast.type === 'success' ? 'bg-emerald-500/90' :
              toast.type === 'error' ? 'bg-rose-500/90' : 'bg-slate-800/90'
              }`}
          >
            {toast.type === 'success' && <ShieldCheck size={20} />}
            {toast.type === 'error' && <AlertCircle size={20} />}
            <span>{toast.message}</span>
          </motion.div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">{editingItem ? 'Editar' : 'Novo'} {modalType === 'owners' ? 'Proprietário' : modalType === 'tenants' ? 'Inquilino' : modalType === 'properties' ? 'Imóvel' : modalType === 'brokers' ? 'Corretor' : 'Contrato'}</h3>
              <button onClick={() => { setShowModal(false); setEditingItem(null); setExtraCharges([]); setSecondaryOwners([]); setUploadedUrl(''); }} className="text-slate-400 hover:text-slate-600">
                <Plus className="rotate-45" size={24} />
              </button>
            </div>

            <form
              onSubmit={
                modalType === 'owners' ? handleCreateOwner :
                  modalType === 'tenants' ? handleCreateTenant :
                    modalType === 'properties' ? handleCreateProperty :
                      modalType === 'brokers' ? handleCreateBroker :
                        modalType === 'inspections' ? handleCreateInspection :
                          modalType === 'maintenances' ? handleCreateMaintenance :
                            handleCreateContract
              }
              className="space-y-4"
            >
              {modalType === 'owners' || modalType === 'tenants' || modalType === 'brokers' ? (
                <>
                  <Input label="Nome Completo" name="name" defaultValue={editingItem?.name} required />
                  <Input label="Email" name="email" type="email" defaultValue={editingItem?.email} required />
                  <Input label="Telefone" name="phone" defaultValue={editingItem?.phone} required />
                  <Input label="CPF/CNPJ" name="document" defaultValue={editingItem?.document} required />

                  {modalType === 'owners' && (
                    <div className="pt-4 border-t border-slate-100 mt-4 space-y-4">
                      <h4 className="font-bold text-slate-800 flex items-center space-x-2">
                        <DollarSign size={18} className="text-emerald-500" />
                        <span>Dados Bancários para Repasse</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <Input label="Cód. Banco (Ex: 001)" name="bank_code" defaultValue={editingItem?.bank_code} />
                        <Input label="Agência" name="bank_agency" defaultValue={editingItem?.bank_agency} />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                          <Input label="Conta" name="bank_account" defaultValue={editingItem?.bank_account} />
                        </div>
                        <Input label="Dígito" name="bank_account_digit" defaultValue={editingItem?.bank_account_digit} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Tipo de Conta</label>
                        <select name="bank_account_type" defaultValue={editingItem?.bank_account_type || 'CHECKING_ACCOUNT'} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none">
                          <option value="CHECKING_ACCOUNT">Corrente</option>
                          <option value="SAVINGS_ACCOUNT">Poupança</option>
                        </select>
                      </div>
                      <Input label="Chave PIX (Opcional)" name="pix_key" defaultValue={editingItem?.pix_key} />
                    </div>
                  )}

                  {modalType === 'brokers' && (
                    <div className="pt-4 border-t border-slate-100 mt-4 space-y-4">
                      <h4 className="font-bold text-slate-800 flex items-center space-x-2">
                        <DollarSign size={18} className="text-emerald-500" />
                        <span>Dados para Comissão (PIX)</span>
                      </h4>
                      <Input label="Chave PIX" name="pix_key" defaultValue={editingItem?.pix_key} />
                    </div>
                  )}

                  {modalType === 'tenants' && (
                    <div className="pt-4 border-t border-slate-100 mt-4 space-y-2">
                      <label className="text-sm font-medium text-slate-700">Histórico de Ocorrências</label>
                      <textarea
                        name="history"
                        defaultValue={editingItem?.history}
                        placeholder="Insira informações de ocorrência ao longo da locação..."
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none h-32 text-sm"
                      />
                    </div>
                  )}
                </>
              ) : modalType === 'properties' ? (
                <>
                  <Input label="Endereço Completo" name="address" defaultValue={editingItem?.address} required />
                  <FileUpload onUpload={(url) => setUploadedUrl(url)} label="Foto do Imóvel / Documento" />
                  <Input label="Links de Documentos (Opcional)" name="document_links" defaultValue={uploadedUrl || editingItem?.document_links} placeholder="URL ou Upload acima" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Tipo</label>
                      <select name="type" defaultValue={editingItem?.type} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" required>
                        <option value="">Selecione...</option>
                        <option value="Casa">Casa</option>
                        <option value="Apartamento">Apartamento</option>
                        <option value="Comercial">Comercial</option>
                        <option value="Terreno">Terreno</option>
                      </select>
                    </div>
                    <Input label="Tamanho (m²)" name="size" type="number" step="0.01" defaultValue={editingItem?.size} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Quartos" name="rooms" type="number" defaultValue={editingItem?.rooms} required />
                    <Input label="Banheiros" name="bathrooms" type="number" defaultValue={editingItem?.bathrooms || 0} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Vagas Garagem" name="garage_spaces" type="number" defaultValue={editingItem?.garage_spaces || 0} required />
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Aceita Pet?</label>
                      <select name="pets_allowed" defaultValue={editingItem?.pets_allowed || 0} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" required>
                        <option value="0">Não</option>
                        <option value="1">Sim</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Uso</label>
                      <select name="usage_type" defaultValue={editingItem?.usage_type || 'individual'} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" required>
                        <option value="individual">Individual</option>
                        <option value="compartilhado">Compartilhado</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Proprietário Principal</label>
                      <select name="owner_id" defaultValue={editingItem?.owner_id} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" required>
                        <option value="">Selecione...</option>
                        {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-slate-700">Outros Responsáveis / Coproprietários</label>
                      <button
                        type="button"
                        onClick={() => setSecondaryOwners([...secondaryOwners, { owner_id: 0, share_percent: 0 }])}
                        className="text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg flex items-center space-x-1"
                      >
                        <Plus size={14} />
                        <span>Adicionar</span>
                      </button>
                    </div>
                    <div className="space-y-2">
                      {secondaryOwners.map((so, index) => (
                        <div key={index} className="flex space-x-2 items-end">
                          <div className="flex-1">
                            <select
                              value={so.owner_id}
                              onChange={(e) => {
                                const newSO = [...secondaryOwners];
                                newSO[index].owner_id = parseInt(e.target.value);
                                setSecondaryOwners(newSO);
                              }}
                              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                            >
                              <option value="0">Selecione...</option>
                              {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                            </select>
                          </div>
                          <div className="w-24">
                            <input
                              type="number"
                              placeholder="%"
                              value={so.share_percent}
                              onChange={(e) => {
                                const newSO = [...secondaryOwners];
                                newSO[index].share_percent = parseFloat(e.target.value) || 0;
                                setSecondaryOwners(newSO);
                              }}
                              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setSecondaryOwners(secondaryOwners.filter((_, i) => i !== index))}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Imóvel</label>
                    <select name="property_id" defaultValue={editingItem?.property_id} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" required>
                      <option value="">Selecione...</option>
                      {properties.map(p => <option key={p.id} value={p.id}>{p.address}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Inquilino</label>
                    <select name="tenant_id" defaultValue={editingItem?.tenant_id} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" required>
                      <option value="">Selecione...</option>
                      {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Data Início" name="start_date" type="date" defaultValue={editingItem?.start_date} required />
                    <Input label="Data Fim" name="end_date" type="date" defaultValue={editingItem?.end_date} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Valor Aluguel" name="rent_value" type="number" step="0.01" defaultValue={editingItem?.rent_value} required />
                    <Input label="Dia Vencimento" name="due_day" type="number" min="1" max="31" defaultValue={editingItem?.due_day} required />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Input label="Taxa Adm (%)" name="admin_tax" type="number" step="0.1" defaultValue={editingItem?.admin_tax} required />
                    <Input label="Encargos (R$)" name="charges" type="number" step="0.01" defaultValue={editingItem?.charges || 0} />
                    <FileUpload onUpload={(url) => setUploadedUrl(url)} label="Contrato PDF" />
                    <Input label="Link do Contrato Digital" name="document_links" defaultValue={uploadedUrl || editingItem?.document_links} placeholder="Google Drive ou Upload acima" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Status IPTU</label>
                      <select name="iptu_status" defaultValue={editingItem?.iptu_status || 'pending'} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none">
                        <option value="pending">Pendente</option>
                        <option value="paid">Pago</option>
                        <option value="n/a">N/A</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Status Condomínio</label>
                      <select name="condo_status" defaultValue={editingItem?.condo_status || 'pending'} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none">
                        <option value="pending">Pendente</option>
                        <option value="paid">Pago</option>
                        <option value="n/a">N/A</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Status Contrato</label>
                      <select name="status" defaultValue={editingItem?.status || 'ativo'} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none">
                        <option value="ativo">Ativo</option>
                        <option value="finalizado">Finalizado</option>
                        <option value="suspenso">Suspenso</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                    <Input label="Último Reajuste" name="last_adjustment_date" type="date" defaultValue={editingItem?.last_adjustment_date} />
                    <Input label="Próximo Reajuste" name="next_adjustment_date" type="date" defaultValue={editingItem?.next_adjustment_date} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Índice de Reajuste</label>
                    <select name="adjustment_index" defaultValue={editingItem?.adjustment_index || 'IGPM'} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" required>
                      <option value="IGPM">IGPM</option>
                      <option value="IPCA">IPCA</option>
                      <option value="INPC">INPC</option>
                      <option value="FIPE">FIPE</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  <div className="pt-4 border-t border-slate-100 space-y-4">
                    <h4 className="font-bold text-slate-800 flex items-center space-x-2">
                      <ShieldCheck size={18} className="text-emerald-500" />
                      <span>Garantia Locatícia</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Tipo de Garantia</label>
                        <select name="guarantee_type" defaultValue={editingItem?.guarantee_type || 'Depósito'} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none">
                          <option value="Depósito">Depósito</option>
                          <option value="Seguro Fiança">Seguro Fiança</option>
                          <option value="Fiador">Fiador</option>
                          <option value="Título de Capitalização">Título de Capitalização</option>
                          <option value="Cartão de Crédito">Cartão de Crédito</option>
                          <option value="Sem Garantia">Sem Garantia</option>
                        </select>
                      </div>
                      <Input label="Valor da Garantia" name="guarantee_value" type="number" step="0.01" defaultValue={editingItem?.guarantee_value || 0} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Data Pagamento" name="guarantee_payment_date" type="date" defaultValue={editingItem?.guarantee_payment_date} />
                      <Input label="Data Repasse/Devolução" name="guarantee_return_date" type="date" defaultValue={editingItem?.guarantee_return_date} />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-4">
                    <h4 className="font-bold text-slate-800 flex items-center space-x-2">
                      <Zap size={18} className="text-emerald-500" />
                      <span>Instalações (Nº Medidores)</span>
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <Input label="Água" name="water_installation" defaultValue={editingItem?.water_installation} />
                      <Input label="Luz" name="electricity_installation" defaultValue={editingItem?.electricity_installation} />
                      <Input label="Gás" name="gas_installation" defaultValue={editingItem?.gas_installation} />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-4">
                    <h4 className="font-bold text-slate-800 flex items-center space-x-2">
                      <UserPlus size={18} className="text-emerald-500" />
                      <span>Comissões e Corretores</span>
                    </h4>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Corretor Responsável</label>
                      <select name="broker_id" defaultValue={editingItem?.broker_id} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none">
                        <option value="">Nenhum</option>
                        {brokers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Comissão Corretor (%)" name="broker_commission_percent" type="number" step="0.01" defaultValue={editingItem?.broker_commission_percent || 0} />
                      <Input label="Taxa Locação Imobiliária (R$)" name="agency_commission_value" type="number" step="0.01" defaultValue={editingItem?.agency_commission_value || 0} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-slate-700">Cobranças Adicionais (Garagem, Água, Luz...)</label>
                      <button
                        type="button"
                        onClick={() => setExtraCharges([...extraCharges, { description: '', value: 0, period: 'Mensal' }])}
                        className="text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg flex items-center space-x-1"
                      >
                        <Plus size={14} />
                        <span>Adicionar</span>
                      </button>
                    </div>
                    <div className="space-y-2">
                      {extraCharges.map((charge, index) => (
                        <div key={index} className="flex space-x-2 items-end">
                          <div className="flex-1">
                            <input
                              placeholder="Descrição (ex: Garagem)"
                              value={charge.description}
                              onChange={(e) => {
                                const newCharges = [...extraCharges];
                                newCharges[index].description = e.target.value;
                                setExtraCharges(newCharges);
                              }}
                              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div className="w-24">
                            <input
                              type="number"
                              placeholder="Valor"
                              value={charge.value}
                              onChange={(e) => {
                                const newCharges = [...extraCharges];
                                newCharges[index].value = parseFloat(e.target.value) || 0;
                                setExtraCharges(newCharges);
                              }}
                              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div className="w-28">
                            <select
                              value={charge.period}
                              onChange={(e) => {
                                const newCharges = [...extraCharges];
                                newCharges[index].period = e.target.value;
                                setExtraCharges(newCharges);
                              }}
                              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                            >
                              <option value="Mensal">Mensal</option>
                              <option value="Única">Única</option>
                              <option value="Anual">Anual</option>
                              <option value="Trimestral">Trimestral</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => setExtraCharges(extraCharges.filter((_, i) => i !== index))}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                          >
                            <Plus size={16} className="rotate-45" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Input label="Valor Repasse" name="transfer_value" type="number" step="0.01" defaultValue={editingItem?.transfer_value} required />
                </>
              )}

              {modalType === 'inspections' && (
                <>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Contrato</label>
                    <select name="contract_id" defaultValue={editingItem?.contract_id} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" required>
                      {(Array.isArray(contracts) ? contracts : []).map(c => {
                        const prop = properties.find(p => p.id === c.property_id);
                        return <option key={c.id} value={c.id}>{prop?.address} - {c.start_date}</option>
                      })}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Tipo</label>
                      <select name="type" defaultValue={editingItem?.type || 'check-in'} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none">
                        <option value="check-in">Entrada (Check-in)</option>
                        <option value="check-out">Saída (Check-out)</option>
                      </select>
                    </div>
                    <Input label="Data" name="date" type="date" defaultValue={editingItem?.date} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Descrição/Observações</label>
                    <textarea name="description" defaultValue={editingItem?.description} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none h-24" />
                  </div>
                  <Input label="Link das Fotos" name="photos_link" defaultValue={editingItem?.photos_link} placeholder="Google Drive, Dropbox, etc" />
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Status</label>
                    <select name="status" defaultValue={editingItem?.status || 'pending'} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none">
                      <option value="pending">Pendente</option>
                      <option value="completed">Concluída</option>
                    </select>
                  </div>
                </>
              )}

              {modalType === 'maintenances' && (
                <>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Imóvel</label>
                    <select name="property_id" defaultValue={editingItem?.property_id} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" required>
                      {properties.map(p => <option key={p.id} value={p.id}>{p.address}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Descrição do Problema</label>
                    <textarea name="description" defaultValue={editingItem?.description} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none h-24" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Data Solicitação" name="request_date" type="date" defaultValue={editingItem?.request_date} required />
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Pago Por</label>
                      <select name="paid_by" defaultValue={editingItem?.paid_by || 'owner'} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none">
                        <option value="owner">Proprietário</option>
                        <option value="tenant">Inquilino</option>
                        <option value="agency">Imobiliária</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Custo Estimado" name="estimated_cost" type="number" step="0.01" defaultValue={editingItem?.estimated_cost || 0} />
                    <Input label="Custo Real" name="actual_cost" type="number" step="0.01" defaultValue={editingItem?.actual_cost || 0} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Status</label>
                      <select name="status" defaultValue={editingItem?.status || 'pending'} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none">
                        <option value="pending">Pendente</option>
                        <option value="approved">Aprovado</option>
                        <option value="completed">Concluído</option>
                        <option value="rejected">Rejeitado</option>
                      </select>
                    </div>
                    <Input label="Link das Fotos/Orçamentos" name="photos_link" defaultValue={editingItem?.photos_link} />
                  </div>
                </>
              )}

              <button type="submit" className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200 mt-4">
                {editingItem ? 'Atualizar' : 'Salvar'} Registro
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Renewal Modal */}
      {showRenewModal && renewingContract && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Renovar Contrato</h3>
              <button onClick={() => { setShowRenewModal(false); setRenewingContract(null); }} className="text-slate-400 hover:text-slate-600">
                <Plus className="rotate-45" size={24} />
              </button>
            </div>

            <div className="mb-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Imóvel</div>
              <div className="font-bold text-slate-700">{renewingContract.address}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-3 mb-1">Inquilino</div>
              <div className="font-bold text-slate-700">{renewingContract.tenant_name}</div>
            </div>

            <form onSubmit={handleRenewContract} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Data Início Nova" 
                  name="start_date" 
                  type="date" 
                  defaultValue={
                    renewingContract.end_date 
                      ? (() => {
                          const oldEnd = new Date(renewingContract.end_date);
                          oldEnd.setDate(oldEnd.getDate() + 1);
                          return oldEnd.toISOString().split('T')[0];
                        })()
                      : new Date().toISOString().split('T')[0]
                  } 
                  required 
                />
                <Input 
                  label="Data Fim Nova" 
                  name="end_date" 
                  type="date" 
                  defaultValue={
                    renewingContract.end_date 
                      ? (() => {
                          const oldEnd = new Date(renewingContract.end_date);
                          oldEnd.setFullYear(oldEnd.getFullYear() + 1); // Default to +1 year
                          return oldEnd.toISOString().split('T')[0];
                        })()
                      : new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
                  } 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Novo Valor Aluguel" 
                  name="rent_value" 
                  type="number" 
                  step="0.01" 
                  defaultValue={renewingContract.rent_value} 
                  required 
                />
                <Input 
                  label="Dia Vencimento" 
                  name="due_day" 
                  type="number" 
                  min="1" 
                  max="31" 
                  defaultValue={renewingContract.due_day} 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Taxa Adm (%)" 
                  name="admin_tax" 
                  type="number" 
                  step="0.1" 
                  defaultValue={renewingContract.fees} 
                  required 
                />
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Índice Reajuste</label>
                  <select name="adjustment_index" defaultValue={renewingContract.adjustment_index || 'IGPM'} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" required>
                    <option value="IGPM">IGPM</option>
                    <option value="IPCA">IPCA</option>
                    <option value="INPC">INPC</option>
                    <option value="FIPE">FIPE</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Tipo de Garantia</label>
                  <select name="guarantee_type" defaultValue={renewingContract.guarantee_type || 'Depósito'} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none">
                    <option value="Depósito">Depósito</option>
                    <option value="Seguro Fiança">Seguro Fiança</option>
                    <option value="Fiador">Fiador</option>
                    <option value="Título de Capitalização">Título de Capitalização</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Sem Garantia">Sem Garantia</option>
                  </select>
                </div>
                <Input label="Valor da Garantia" name="guarantee_value" type="number" step="0.01" defaultValue={renewingContract.guarantee_value || 0} />
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 mt-4">
                Confirmar Renovação
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Payment Processing Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Processar Pagamento</h3>
              <button onClick={() => { setShowPaymentModal(false); setSelectedPayment(null); setExtraPayments([]); }} className="text-slate-400 hover:text-slate-600">
                <Plus className="rotate-45" size={24} />
              </button>
            </div>

            <form onSubmit={handleProcessPayment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Data Recebimento" name="received_date" type="date" defaultValue={selectedPayment.received_date || new Date().toISOString().split('T')[0]} required />
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Forma de Pagamento</label>
                  <select name="payment_method" defaultValue={selectedPayment.payment_method || 'Pix'} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" required>
                    <option value="Pix">Pix</option>
                    <option value="Transferência">Transferência</option>
                    <option value="Boleto">Boleto</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Cartão">Cartão</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Input label="Valor Pago" name="amount_paid" type="number" step="0.01" defaultValue={selectedPayment.amount_paid || 0} required />
                  <button
                    type="button"
                    onClick={() => {
                      const contract = contracts.find(c => c.id === selectedPayment.contract_id);
                      if (contract) {
                        const rent = contract.rent_value;
                        const charges = contract.charges || 0;
                        const extras = (Array.isArray(extraPayments) ? extraPayments : []).reduce((acc, curr) => acc + (curr.value || 0), 0);
                        const total = rent + charges + extras;
                        const input = document.querySelector('input[name="amount_paid"]') as HTMLInputElement;
                        if (input) input.value = total.toFixed(2);
                      }
                    }}
                    className="absolute right-2 top-8 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded hover:bg-emerald-200 transition-colors font-bold"
                  >
                    Calcular
                  </button>
                </div>
                <Input label="Data Repasse" name="transfer_date" type="date" defaultValue={selectedPayment.transfer_date || new Date().toISOString().split('T')[0]} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Input label="Valor Repasse" name="transfer_amount" type="number" step="0.01" defaultValue={selectedPayment.transfer_amount || 0} required />
                  <button
                    type="button"
                    onClick={() => {
                      const contract = contracts.find(c => c.id === selectedPayment.contract_id);
                      if (contract) {
                        const rent = contract.rent_value;
                        const adminTax = contract.admin_tax || 0;
                        const charges = contract.charges || 0;
                        const extras = (Array.isArray(extraPayments) ? extraPayments : []).reduce((acc, curr) => acc + (curr.value || 0), 0);
                        const debts = debtsValue;
                        const suggested = (rent * (1 - adminTax / 100)) + charges + extras - debts;
                        const input = document.querySelector('input[name="transfer_amount"]') as HTMLInputElement;
                        if (input) input.value = suggested.toFixed(2);
                      }
                    }}
                    className="absolute right-2 top-8 text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors font-bold"
                  >
                    Sugerir
                  </button>
                </div>
                <Input 
                  label="Débitos (IPTU/Condo)" 
                  name="debts_value" 
                  type="number" 
                  step="0.01" 
                  value={debtsValue} 
                  onChange={(e: any) => setDebtsValue(parseFloat(e.target.value) || 0)} 
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resumo do Cálculo</h4>
                <div className="space-y-1 text-sm">
                  {(() => {
                    const contract = contracts.find(c => c.id === selectedPayment.contract_id);
                    if (!contract) return null;
                    const rent = contract.rent_value;
                    const adminTax = contract.admin_tax || 0;
                    const charges = contract.charges || 0;
                    const extras = (Array.isArray(extraPayments) ? extraPayments : []).reduce((acc, curr) => acc + (curr.value || 0), 0);
                    const adminValue = (rent * adminTax) / 100;

                    return (
                      <>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Aluguel Base:</span>
                          <span className="font-medium">R$ {rent.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Taxa Adm ({adminTax}%):</span>
                          <span className="font-medium text-rose-500">- R$ {adminValue.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Encargos (IPTU/Condo):</span>
                          <span className="font-medium">R$ {charges.toLocaleString('pt-BR')}</span>
                        </div>
                        {extras > 0 && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Adicionais:</span>
                            <span className="font-medium">R$ {extras.toLocaleString('pt-BR')}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-slate-500">Débitos Dedução:</span>
                          <span className="font-medium text-rose-500">- R$ {debtsValue.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-emerald-600">
                          <span>Total Sugerido:</span>
                          <span>R$ {(rent - adminValue + charges + extras - debtsValue).toLocaleString('pt-BR')}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-700">Pagamentos Adicionais (Condomínio, Água...)</label>
                  <button
                    type="button"
                    onClick={() => setExtraPayments([...extraPayments, { description: '', value: 0 }])}
                    className="text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg flex items-center space-x-1"
                  >
                    <Plus size={14} />
                    <span>Adicionar</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {extraPayments.map((charge, index) => (
                    <div key={index} className="flex space-x-2 items-end">
                      <div className="flex-1">
                        <input
                          placeholder="Descrição (ex: Água)"
                          value={charge.description}
                          onChange={(e) => {
                            const newCharges = [...extraPayments];
                            newCharges[index].description = e.target.value;
                            setExtraPayments(newCharges);
                          }}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          placeholder="Valor"
                          value={charge.value}
                          onChange={(e) => {
                            const newCharges = [...extraPayments];
                            newCharges[index].value = parseFloat(e.target.value) || 0;
                            setExtraPayments(newCharges);
                          }}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setExtraPayments(extraPayments.filter((_, i) => i !== index))}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                      >
                        <Plus size={16} className="rotate-45" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200 mt-4">
                Confirmar Pagamento
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {showRepasseModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold">Repasses Pendentes</h3>
                <p className="text-slate-500 text-sm">Valores recebidos que aguardam transferência para os proprietários.</p>
              </div>
              <button onClick={() => setShowRepasseModal(false)} className="text-slate-400 hover:text-slate-600">
                <Plus className="rotate-45" size={24} />
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-white border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-500">Proprietário</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-500">Imóvel</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-500">Data Receb.</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-500">Valor Líquido</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-500">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(Array.isArray(payments) ? payments : []).filter(p => p.status === 'paid' && p.transfer_status === 'pending').map(p => {
                    const property = properties.find(prop => prop.id === contracts.find(c => c.id === p.contract_id)?.property_id);
                    const owner = owners.find(o => o.id === property?.owner_id);

                    return (
                      <tr key={p.id} className="hover:bg-white transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium">{owner?.name || '-'}</div>
                          <div className="text-[10px] text-slate-400">{owner?.bank_code ? `Banco: ${owner.bank_code} / Ag: ${owner.bank_agency} / Cc: ${owner.bank_account}` : 'Dados bancários ausentes'}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{property?.address || '-'}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{formatDate(p.received_date)}</td>
                        <td className="px-6 py-4 font-bold text-blue-600">R$ {p.transfer_amount?.toLocaleString('pt-BR')}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => { setSelectedPayment(p); setShowRepasseDetailModal(true); }}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-100 rounded-xl font-bold transition-all"
                          >
                            <Zap size={16} />
                            <span>Repassar</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {(Array.isArray(payments) ? payments : []).filter(p => p.status === 'paid' && p.transfer_status === 'pending').length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                        Nenhum repasse pendente no momento.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}

      {showRepasseDetailModal && selectedPayment && (() => {
        const contract = contracts.find(c => c.id === selectedPayment.contract_id);
        const property = properties.find(prop => prop.id === contract?.property_id);
        const owner = owners.find(o => o.id === property?.owner_id);
        if (!contract) return null;

        const rent = contract.rent_value;
        const adminTax = contract.admin_tax || 0;
        const charges = contract.charges || 0;
        const extras = selectedPayment.extra_payments ? JSON.parse(selectedPayment.extra_payments).reduce((acc: number, curr: any) => acc + (curr.value || 0), 0) : 0;
        const debts = selectedPayment.debts_value || 0;
        const adminValue = (rent * adminTax) / 100;
        const netSuggested = rent - adminValue + charges + extras - debts;

        return (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase">Ref: {formatDate(selectedPayment.due_date)}</span>
                  <h3 className="text-2xl font-black text-slate-800 mt-2">Detalhamento do Repasse</h3>
                  <p className="text-slate-500 text-sm">{property?.address || '-'}</p>
                </div>
                <button onClick={() => setShowRepasseDetailModal(false)} className="text-slate-400 hover:text-slate-600">
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>

              {/* Informações do Proprietário */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Proprietário</h4>
                <p className="font-bold text-slate-700">{owner?.name || 'Não cadastrado'}</p>
                {owner?.bank_code ? (
                  <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                    <p><strong>Banco:</strong> {owner.bank_code} ({owner.bank_name || ''})</p>
                    <p><strong>Agência/Conta:</strong> {owner.bank_agency} / {owner.bank_account}</p>
                    {owner.pix_key && <p><strong>Chave PIX:</strong> {owner.pix_key}</p>}
                  </div>
                ) : (
                  <p className="text-xs text-red-500 font-bold mt-1">⚠️ Dados bancários ausentes para repasse automático.</p>
                )}
              </div>

              {/* Cálculo do Repasse */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cálculo Financeiro</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Aluguel:</span>
                    <span className="font-bold text-slate-700">R$ {rent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Taxa Adm ({adminTax}%):</span>
                    <span className="font-bold text-rose-500">- R$ {adminValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {charges > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Encargos:</span>
                      <span className="font-bold text-slate-700">R$ {charges.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {extras > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Adicionais:</span>
                      <span className="font-bold text-slate-700">R$ {extras.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {debts > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Deduções/Débitos:</span>
                      <span className="font-bold text-rose-500">- R$ {debts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-emerald-600 text-base">
                    <span>Valor Líquido:</span>
                    <span>R$ {netSuggested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="space-y-3">
                <button
                  onClick={() => handleAsaasTransfer(selectedPayment.id)}
                  disabled={!owner?.bank_code}
                  className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${owner?.bank_code
                    ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-100'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Zap size={18} />
                  <span>Repassar Automático (Asaas)</span>
                </button>
                <button
                  onClick={() => handleManualTransfer(selectedPayment.id)}
                  className="w-full py-3.5 rounded-xl font-bold border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 size={18} className="text-emerald-500" />
                  <span>Confirmar Repasse Manual</span>
                </button>
              </div>
            </motion.div>
          </div>
        );
      })()}

      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Importar Dados</h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">
                <Plus className="rotate-45" size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <p className="text-slate-500 text-sm">Selecione o tipo de dado e faça o upload do arquivo CSV. Certifique-se de que os cabeçalhos do CSV correspondem aos campos do sistema.</p>

              <div className="grid grid-cols-1 gap-4">
                <ImportSection
                  title="Proprietários"
                  onUpload={(file) => handleImportFile('owners', file)}
                  fields="name, email, phone, document, bank_code, bank_agency, bank_account, bank_account_digit, bank_account_type, pix_key"
                />
                <ImportSection
                  title="Inquilinos"
                  onUpload={(file) => handleImportFile('tenants', file)}
                  fields="name, email, phone, document"
                />
                <ImportSection
                  title="Imóveis"
                  onUpload={(file) => handleImportFile('properties', file)}
                  fields="address, type, size, rooms, bathrooms, garage_spaces, pets_allowed, usage_type, owner_id"
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function ImportSection({ title, onUpload, fields }: { title: string, onUpload: (file: File) => void, fields: string }) {
  return (
    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-bold text-slate-800">{title}</h4>
        <label className="cursor-pointer bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-600 transition-all flex items-center space-x-1">
          <Upload size={14} />
          <span>Selecionar Arquivo</span>
          <input
            type="file"
            accept=".csv, .xlsx, .xls"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }}
          />
        </label>
      </div>
      <p className="text-[10px] text-slate-400 font-mono break-all">Campos: {fields}</p>
      <p className="text-[9px] text-slate-400 mt-1">Suporta CSV e Excel (.xlsx, .xls)</p>
    </div>
  );
}

function ManualSection({ title, content }: { title: string, content: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-100 rounded-2xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <span className="font-bold text-slate-700">{title}</span>
        {isOpen ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />}
      </button>
      {isOpen && (
        <div className="p-5 bg-white text-slate-600 leading-relaxed text-sm whitespace-pre-line">
          {content}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number, color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center space-x-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-orange-100 text-orange-700',
    overdue: 'bg-rose-100 text-rose-700',
  };

  const labels: Record<string, string> = {
    paid: 'Pago',
    pending: 'Pendente',
    overdue: 'Atrasado',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function ReportCard({ title, desc, onClick }: { title: string, desc: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="bg-white p-6 rounded-2xl border border-slate-200 text-left hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/5 transition-all group"
    >
      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 mb-4 transition-colors">
        <BarChart3 size={24} />
      </div>
      <h4 className="font-bold text-slate-800 mb-1">{title}</h4>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </button>
  );
}

function Input({ label, ...props }: any) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        {...props}
        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
      />
    </div>
  );
}


