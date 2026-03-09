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
  ChevronDown
} from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'motion/react';
import { Owner, Tenant, Property, Contract, Payment, Broker, Inspection, Maintenance } from './types';
import Auth from './Auth';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRepasseModal, setShowRepasseModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [extraPayments, setExtraPayments] = useState<{ description: string, value: number }[]>([]);
  const [secondaryOwners, setSecondaryOwners] = useState<{ owner_id: number, share_percent: number }[]>([]);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [user, setUser] = useState<{ id: string | number, name: string, email?: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [dbStatus, setDbStatus] = useState<{ connected: boolean, error?: string, hasUsers?: boolean } | null>(null);

  useEffect(() => {
    checkAuth();
    checkDbStatus();
  }, []);

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

      const data = await Promise.all(responses.map(res => res.ok ? res.json() : []));
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

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      const [year, month, day] = dateStr.split('-');
      return `${day}-${month}-${year}`;
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

  const handleAsaasTransfer = async (paymentId: number) => {
    if (!confirm('Deseja realizar o repasse para o proprietário via Asaas agora?')) return;
    try {
      const res = await fetch(`/api/asaas/transfer/${paymentId}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert('Repasse realizado com sucesso!');
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
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === id
        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
        : 'text-slate-500 hover:bg-slate-100'
        }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  if (!authChecked) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return <Auth onLogin={(u) => { setUser(u); fetchData(); }} />;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col">
        <div className="flex items-center space-x-3 mb-10 px-2">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <Home size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">ImobiGestão</h1>
        </div>

        <nav className="space-y-2 flex-1">
          <SidebarItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem id="owners" icon={Users} label="Proprietários" />
          <SidebarItem id="tenants" icon={UserCheck} label="Inquilinos" />
          <SidebarItem id="properties" icon={Home} label="Imóveis" />
          <SidebarItem id="contracts" icon={FileText} label="Contratos" />
          <SidebarItem id="inspections" icon={ShieldCheck} label="Vistorias" />
          <SidebarItem id="maintenances" icon={RefreshCw} label="Manutenções" />
          <SidebarItem id="brokers" icon={UserPlus} label="Corretores" />
          <SidebarItem id="financial" icon={DollarSign} label="Financeiro" />
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
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight capitalize">{activeTab === 'dashboard' ? 'Visão Geral' : activeTab === 'manual' ? 'Manual & Ajuda' : activeTab === 'brokers' ? 'Corretores' : activeTab === 'inspections' ? 'Vistorias' : activeTab === 'maintenances' ? 'Manutenções' : activeTab}</h2>
            <p className="text-slate-500">Bem-vindo ao seu painel de controle imobiliário.</p>
          </div>
          <div className="flex space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar..."
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
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={Users} label="Proprietários" value={owners.length} color="blue" />
                    <StatCard icon={UserCheck} label="Inquilinos" value={tenants.length} color="emerald" />
                    <StatCard icon={Home} label="Imóveis" value={properties.length} color="purple" />
                    <StatCard icon={DollarSign} label="Receita Mensal" value={`R$ ${(Array.isArray(contracts) ? contracts : []).reduce((acc, curr) => acc + (curr.rent_value || 0), 0).toLocaleString('pt-BR')}`} color="orange" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      <section>
                        <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                          <DollarSign className="text-emerald-500" size={20} />
                          <span>Previsão de Receita (6 Meses)</span>
                        </h3>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 h-80 shadow-sm">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[
                              { name: 'Jan', val: 4000 },
                              { name: 'Fev', val: 3000 },
                              { name: 'Mar', val: 2000 },
                              { name: 'Abr', val: 2780 },
                              { name: 'Mai', val: 1890 },
                              { name: 'Jun', val: 2390 },
                            ].map((d, i) => {
                              const baseVal = (Array.isArray(contracts) ? contracts : []).reduce((acc, curr) => acc + (curr.rent_value || 0), 0);
                              return { name: d.name, valor: baseVal * (1 + (i * 0.05)) };
                            })}>
                              <defs>
                                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                              <Tooltip
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                              />
                              <Area type="monotone" dataKey="valor" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-xl font-bold mb-4">Pagamentos Recentes</h3>
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                          <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                              <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-500">Inquilino</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-500">Imóvel</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-500">Vencimento</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-500">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {(Array.isArray(payments) ? payments : []).slice(0, 5).map(p => (
                                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-6 py-4 font-medium">{p.tenant_name}</td>
                                  <td className="px-6 py-4 text-slate-500">{p.address}</td>
                                  <td className="px-6 py-4 text-slate-500">{formatDate(p.due_date)}</td>
                                  <td className="px-6 py-4">
                                    <div className="flex space-x-2">
                                      <StatusBadge status={p.status} />
                                      {p.status === 'pending' && (
                                        <button
                                          onClick={() => handleAsaasPayment(p.id)}
                                          className="text-blue-500 hover:text-blue-600 font-medium text-sm flex items-center space-x-1"
                                          title="Gerar Boleto/Pix no Asaas"
                                        >
                                          <ExternalLink size={14} />
                                          <span>Asaas</span>
                                        </button>
                                      )}
                                      {p.status === 'paid' && p.transfer_status === 'pending' && (
                                        <button
                                          onClick={() => handleAsaasTransfer(p.id)}
                                          className="text-blue-500 hover:text-blue-600 font-medium text-sm flex items-center space-x-1"
                                          title="Realizar Repasse via Asaas"
                                        >
                                          <Zap size={14} />
                                          <span>Repassar</span>
                                        </button>
                                      )}
                                      {p.transfer_status === 'done' && (
                                        <button
                                          onClick={() => {
                                            const property = properties.find(prop => prop.id === contracts.find(c => c.id === p.contract_id)?.property_id);
                                            const owner = owners.find(o => o.id === property?.owner_id);
                                            if (owner?.phone) {
                                              const message = `Olá ${owner.name}, confirmamos que o repasse de R$ ${p.transfer_amount?.toLocaleString('pt-BR')} referente ao imóvel ${property?.address} foi concluído.`;
                                              window.open(`https://wa.me/55${owner.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                                            }
                                          }}
                                          className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center space-x-1"
                                        >
                                          <MessageCircle size={14} />
                                          <span>Whats</span>
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </section>
                    </div>

                    <div className="space-y-6">
                      <section>
                        <h3 className="text-xl font-bold mb-4">Ocupação</h3>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-slate-500 text-sm">Alugados</span>
                            <span className="font-bold text-emerald-600">{contracts.length}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(contracts.length / (properties.length || 1)) * 100}%` }}
                              className="bg-emerald-500 h-full"
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 mt-2">De um total de {properties.length} imóveis</p>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-xl font-bold mb-4">Alertas e Pendências</h3>
                        <div className="space-y-4">
                          {(Array.isArray(inspections) ? inspections : []).filter(i => i.status === 'pending').map(i => (
                            <div key={`insp-${i.id}`} className="p-4 rounded-2xl border flex items-start space-x-3 text-blue-600 bg-blue-50 border-blue-100">
                              <div className="mt-0.5"><ShieldCheck size={18} /></div>
                              <div>
                                <p className="text-sm font-bold">Vistoria Pendente</p>
                                <p className="text-xs opacity-80">{i.address} - {i.type}</p>
                              </div>
                            </div>
                          ))}
                          {(Array.isArray(maintenances) ? maintenances : []).filter(m => m.status === 'pending').map(m => (
                            <div key={`maint-${m.id}`} className="p-4 rounded-2xl border flex items-start space-x-3 text-orange-600 bg-orange-50 border-orange-100">
                              <div className="mt-0.5"><RefreshCw size={18} /></div>
                              <div>
                                <p className="text-sm font-bold">Manutenção Pendente</p>
                                <p className="text-xs opacity-80">{m.address} - {m.description}</p>
                              </div>
                            </div>
                          ))}
                          {(Array.isArray(contracts) ? contracts : []).map(c => {
                            const today = new Date();
                            const endDate = new Date(c.end_date);
                            const startDate = new Date(c.start_date);
                            const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                            const alerts = [];

                            // Expiration Alert (within 60 days)
                            if (diffDays <= 60 && diffDays > 0) {
                              alerts.push({
                                type: 'expiration',
                                title: 'Contrato Vencendo',
                                desc: `O contrato de ${c.tenant_name} vence em ${diffDays} dias.`,
                                icon: Clock,
                                color: 'text-rose-600 bg-rose-50 border-rose-100'
                              });
                            } else if (diffDays <= 0) {
                              alerts.push({
                                type: 'expiration',
                                title: 'Contrato Vencido',
                                desc: `O contrato de ${c.tenant_name} venceu em ${formatDate(c.end_date)}.`,
                                icon: AlertCircle,
                                color: 'text-rose-700 bg-rose-100 border-rose-200'
                              });
                            }

                            // Annual Adjustment Alert (same month as start_date, but different year)
                            const isAdjustmentMonth = today.getMonth() === startDate.getMonth() && today.getFullYear() > startDate.getFullYear();
                            if (isAdjustmentMonth) {
                              alerts.push({
                                type: 'adjustment',
                                title: 'Reajuste Anual',
                                desc: `Mês de reajuste para ${c.tenant_name} (${c.address}).`,
                                icon: ArrowRightLeft,
                                color: 'text-amber-600 bg-amber-50 border-amber-100'
                              });
                            }

                            return alerts.map((alert, idx) => (
                              <div key={`${c.id}-${idx}`} className={`p-4 rounded-2xl border flex items-start space-x-3 ${alert.color}`}>
                                <div className="mt-0.5">
                                  <alert.icon size={18} />
                                </div>
                                <div>
                                  <p className="text-sm font-bold">{alert.title}</p>
                                  <p className="text-xs opacity-80">{alert.desc}</p>
                                </div>
                              </div>
                            ));
                          })}
                          {contracts.length === 0 && (
                            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
                              <p className="text-sm">Nenhum alerta no momento.</p>
                            </div>
                          )}
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'brokers' && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Nome</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Email</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Telefone</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Documento</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(Array.isArray(brokers) ? brokers : []).map(b => (
                        <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium">{b.name}</td>
                          <td className="px-6 py-4 text-slate-500">{b.email}</td>
                          <td className="px-6 py-4 text-slate-500">{b.phone}</td>
                          <td className="px-6 py-4 text-slate-500">{b.document}</td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-3">
                              <button
                                onClick={() => {
                                  setEditingItem(b);
                                  setModalType('brokers');
                                  setShowModal(true);
                                }}
                                className="text-emerald-600 hover:text-emerald-700 font-bold text-sm"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDelete('brokers', b.id)}
                                className="text-rose-500 hover:text-rose-600"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {brokers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                            Nenhum corretor cadastrado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'inspections' && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Imóvel</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Tipo</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Data</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Status</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Fotos</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(Array.isArray(inspections) ? inspections : []).map(i => (
                        <tr key={i.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium">{i.address}</td>
                          <td className="px-6 py-4 text-slate-500 capitalize">{i.type}</td>
                          <td className="px-6 py-4 text-slate-500">{formatDate(i.date)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${i.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                              {i.status === 'completed' ? 'Concluída' : 'Pendente'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {i.photos_link ? (
                              <a href={i.photos_link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center space-x-1">
                                <ExternalLink size={14} />
                                <span>Ver Fotos</span>
                              </a>
                            ) : '-'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-3">
                              <button
                                onClick={() => {
                                  setEditingItem(i);
                                  setModalType('inspections');
                                  setShowModal(true);
                                }}
                                className="text-emerald-600 hover:text-emerald-700 font-bold text-sm"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDelete('inspections', i.id)}
                                className="text-rose-500 hover:text-rose-600"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'maintenances' && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Imóvel</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Descrição</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Data Pedido</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Custo Est.</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Status</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Pago Por</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(Array.isArray(maintenances) ? maintenances : []).map(m => (
                        <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium">{m.address}</td>
                          <td className="px-6 py-4 text-slate-500 truncate max-w-[200px]">{m.description}</td>
                          <td className="px-6 py-4 text-slate-500">{formatDate(m.request_date)}</td>
                          <td className="px-6 py-4 text-slate-500">R$ {m.estimated_cost.toLocaleString('pt-BR')}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${m.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                              m.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                                m.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                                  'bg-orange-100 text-orange-700'
                              }`}>
                              {m.status === 'completed' ? 'Concluído' : m.status === 'approved' ? 'Aprovado' : m.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 capitalize">{m.paid_by || '-'}</td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-3">
                              <button
                                onClick={() => {
                                  setEditingItem(m);
                                  setModalType('maintenances');
                                  setShowModal(true);
                                }}
                                className="text-emerald-600 hover:text-emerald-700 font-bold text-sm"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDelete('maintenances', m.id)}
                                className="text-rose-500 hover:text-rose-600"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'owners' && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Nome</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Email</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Telefone</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Documento</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(Array.isArray(owners) ? owners : []).map(o => (
                        <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium">{o.name}</td>
                          <td className="px-6 py-4 text-slate-500">{o.email}</td>
                          <td className="px-6 py-4 text-slate-500">{o.phone}</td>
                          <td className="px-6 py-4 text-slate-500">{o.document}</td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-3">
                              <button
                                onClick={() => {
                                  setEditingItem(o);
                                  setModalType('owners');
                                  setShowModal(true);
                                }}
                                className="text-emerald-500 hover:text-emerald-600 font-medium text-sm"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDelete('owners', o.id)}
                                className="text-rose-500 hover:text-rose-600"
                              >
                                <Trash2 size={16} />
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
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Nome</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Email</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Telefone</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Documento</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(Array.isArray(tenants) ? tenants : []).map(t => (
                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium">{t.name}</td>
                          <td className="px-6 py-4 text-slate-500">{t.email}</td>
                          <td className="px-6 py-4 text-slate-500">{t.phone}</td>
                          <td className="px-6 py-4 text-slate-500">{t.document}</td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-3">
                              <button
                                onClick={() => {
                                  setEditingItem(t);
                                  setModalType('tenants');
                                  setShowModal(true);
                                }}
                                className="text-emerald-500 hover:text-emerald-600 font-medium text-sm"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDelete('tenants', t.id)}
                                className="text-rose-500 hover:text-rose-600"
                              >
                                <Trash2 size={16} />
                              </button>
                              <button
                                onClick={() => handleAsaasSync(t.id)}
                                className={`flex items-center space-x-1 font-medium text-sm ${(t as any).asaas_id ? 'text-blue-500' : 'text-slate-400'}`}
                                title={(t as any).asaas_id ? 'Sincronizado' : 'Sincronizar com Asaas'}
                              >
                                <Zap size={14} fill={(t as any).asaas_id ? 'currentColor' : 'none'} />
                                <span>{(t as any).asaas_id ? 'Asaas OK' : 'Sinc. Asaas'}</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'properties' && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Endereço</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Tipo</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Tamanho (m²)</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Quartos</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Banheiros</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Vagas</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Pet</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Uso</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Proprietário</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(Array.isArray(properties) ? properties : []).map(p => (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium">{p.address}</td>
                          <td className="px-6 py-4 text-slate-500">{p.type}</td>
                          <td className="px-6 py-4 text-slate-500">{p.size}</td>
                          <td className="px-6 py-4 text-slate-500">{p.rooms}</td>
                          <td className="px-6 py-4 text-slate-500">{p.bathrooms}</td>
                          <td className="px-6 py-4 text-slate-500">{p.garage_spaces}</td>
                          <td className="px-6 py-4 text-slate-500">{p.pets_allowed ? 'Sim' : 'Não'}</td>
                          <td className="px-6 py-4 text-slate-500 capitalize">{p.usage_type}</td>
                          <td className="px-6 py-4 text-slate-500">{p.owner_name}</td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-3">
                              <button
                                onClick={() => {
                                  setEditingItem(p);
                                  setModalType('properties');
                                  setSecondaryOwners(p.secondary_owners || []);
                                  setShowModal(true);
                                }}
                                className="text-emerald-500 hover:text-emerald-600 font-medium text-sm"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDelete('properties', p.id)}
                                className="text-rose-500 hover:text-rose-600"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'contracts' && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Imóvel</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Inquilino</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Valor Base</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Taxas (IPTU/Condo)</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Vigência</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-500">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(Array.isArray(contracts) ? contracts : []).map(c => {
                        const extras = c.extra_charges ? JSON.parse(c.extra_charges) : [];
                        return (
                          <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-medium">{c.address}</td>
                            <td className="px-6 py-4 text-slate-500">{c.tenant_name}</td>
                            <td className="px-6 py-4 font-semibold text-emerald-600">R$ {c.rent_value.toLocaleString('pt-BR')}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-[10px] uppercase font-bold text-slate-400 w-10">IPTU:</span>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${c.iptu_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : c.iptu_status === 'n/a' ? 'bg-slate-100 text-slate-500' : 'bg-orange-100 text-orange-700'}`}>
                                    {c.iptu_status === 'paid' ? 'PAGO' : c.iptu_status === 'n/a' ? 'N/A' : 'PENDENTE'}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-[10px] uppercase font-bold text-slate-400 w-10">CONDO:</span>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${c.condo_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : c.condo_status === 'n/a' ? 'bg-slate-100 text-slate-500' : 'bg-orange-100 text-orange-700'}`}>
                                    {c.condo_status === 'paid' ? 'PAGO' : c.condo_status === 'n/a' ? 'N/A' : 'PENDENTE'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-500">
                              <div className="text-sm">{formatDate(c.start_date)} até {formatDate(c.end_date)}</div>
                              {c.next_adjustment_date && (
                                <div className="text-[10px] text-orange-500 font-medium">Reajuste: {formatDate(c.next_adjustment_date)}</div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => {
                                    setEditingItem(c);
                                    setModalType('contracts');
                                    setExtraCharges(extras);
                                    setShowModal(true);
                                  }}
                                  className="text-emerald-500 hover:text-emerald-600 font-medium text-sm"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDelete('contracts', c.id)}
                                  className="text-rose-500 hover:text-rose-600"
                                >
                                  <Trash2 size={16} />
                                </button>
                                {c.document_links && (
                                  <button
                                    onClick={() => window.open(c.document_links, '_blank')}
                                    className="text-blue-500 hover:text-blue-600"
                                    title="Ver Contrato"
                                  >
                                    <FileText size={16} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'financial' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Gestão Financeira</h2>
                    <button
                      onClick={handleGeneratePayments}
                      className="flex items-center space-x-2 bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200 font-bold"
                    >
                      <Zap size={18} />
                      <span>Gerar Mensalidades do Mês</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                      <p className="text-slate-500 text-sm font-medium mb-1">Total Recebido</p>
                      <p className="text-2xl font-bold text-emerald-600">R$ {(Array.isArray(payments) ? payments : []).filter(p => p.status === 'paid').reduce((acc, curr) => acc + (curr.amount_paid || 0), 0).toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                      <p className="text-slate-500 text-sm font-medium mb-1">Pendente</p>
                      <p className="text-2xl font-bold text-orange-500">R$ {(Array.isArray(payments) ? payments : []).filter(p => p.status === 'pending').reduce((acc, curr) => {
                        const contract = contracts.find(c => c.id === curr.contract_id);
                        return acc + (contract?.rent_value || 0) + (contract?.charges || 0);
                      }, 0).toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                      <p className="text-slate-500 text-sm font-medium mb-1">Total Repassado</p>
                      <p className="text-2xl font-bold text-blue-600">R$ {(Array.isArray(payments) ? payments : []).filter(p => p.status === 'paid').reduce((acc, curr) => acc + (curr.transfer_amount || 0), 0).toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                      <p className="text-slate-500 text-sm font-medium mb-1">Comissões Corretores</p>
                      <p className="text-2xl font-bold text-orange-600">R$ {(Array.isArray(payments) ? payments : []).filter(p => p.status === 'paid').reduce((acc, curr) => acc + (curr.broker_commission_value || 0), 0).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-4 text-sm font-semibold text-slate-500">Inquilino</th>
                          <th className="px-6 py-4 text-sm font-semibold text-slate-500">Vencimento</th>
                          <th className="px-6 py-4 text-sm font-semibold text-slate-500">Recebimento</th>
                          <th className="px-6 py-4 text-sm font-semibold text-slate-500">Valor Pago</th>
                          <th className="px-6 py-4 text-sm font-semibold text-slate-500">Comissão</th>
                          <th className="px-6 py-4 text-sm font-semibold text-slate-500">Líquido Prop.</th>
                          <th className="px-6 py-4 text-sm font-semibold text-slate-500">Comissão Corr.</th>
                          <th className="px-6 py-4 text-sm font-semibold text-slate-500">Status</th>
                          <th className="px-6 py-4 text-sm font-semibold text-slate-500">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {payments.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-medium">{p.tenant_name}</td>
                            <td className="px-6 py-4 text-slate-500">{formatDate(p.due_date)}</td>
                            <td className="px-6 py-4 text-slate-500">{formatDate(p.received_date)}</td>
                            <td className="px-6 py-4 font-medium text-emerald-600">
                              <div>{p.amount_paid ? `R$ ${p.amount_paid.toLocaleString('pt-BR')}` : '-'}</div>
                              {p.extra_payments && JSON.parse(p.extra_payments).length > 0 && (
                                <div className="text-[10px] text-slate-400 font-normal">
                                  +{JSON.parse(p.extra_payments).length} adicionais
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-slate-500">
                              {p.commission_value ? `R$ ${p.commission_value.toLocaleString('pt-BR')}` : '-'}
                            </td>
                            <td className="px-6 py-4 font-semibold text-blue-600">
                              <div>{p.transfer_amount ? `R$ ${p.transfer_amount.toLocaleString('pt-BR')}` : '-'}</div>
                              {p.status === 'paid' && (
                                <div className={`text-[10px] font-normal ${p.transfer_status === 'done' ? 'text-emerald-500' : 'text-orange-500'}`}>
                                  {p.transfer_status === 'done' ? 'Repassado' : 'Pendente'}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-slate-500">
                              {p.broker_commission_value ? `R$ ${p.broker_commission_value.toLocaleString('pt-BR')}` : '-'}
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={p.status} />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedPayment(p);
                                    setExtraPayments(p.extra_payments ? JSON.parse(p.extra_payments) : []);
                                    setShowPaymentModal(true);
                                  }}
                                  className="text-emerald-500 hover:text-emerald-600 font-medium text-sm"
                                >
                                  {p.status === 'pending' ? 'Baixar' : 'Editar'}
                                </button>
                                {p.status === 'pending' && (
                                  <button
                                    onClick={() => handleAsaasPayment(p.id)}
                                    className="text-blue-500 hover:text-blue-600 font-medium text-sm flex items-center space-x-1"
                                    title="Gerar Boleto/Pix no Asaas"
                                  >
                                    <ExternalLink size={14} />
                                    <span>Asaas</span>
                                  </button>
                                )}
                                {p.status === 'paid' && p.transfer_status === 'pending' && (
                                  <button
                                    onClick={() => handleAsaasTransfer(p.id)}
                                    className="text-blue-500 hover:text-blue-600 font-medium text-sm flex items-center space-x-1"
                                    title="Realizar Repasse via Asaas"
                                  >
                                    <Zap size={14} />
                                    <span>Repassar</span>
                                  </button>
                                )}
                                {p.transfer_status === 'done' && (
                                  <button
                                    onClick={() => {
                                      const property = properties.find(prop => prop.id === contracts.find(c => c.id === p.contract_id)?.property_id);
                                      const owner = owners.find(o => o.id === property?.owner_id);
                                      if (owner?.phone) {
                                        const message = `Olá ${owner.name}, confirmamos que o repasse de R$ ${p.transfer_amount?.toLocaleString('pt-BR')} referente ao imóvel ${property?.address} foi concluído.`;
                                        window.open(`https://wa.me/55${owner.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                                      }
                                    }}
                                    className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center space-x-1"
                                  >
                                    <MessageCircle size={14} />
                                    <span>Whats</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'reports' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ReportCard
                      title="Repasses Pendentes"
                      desc="Lista de valores recebidos aguardando transferência para proprietários."
                      onClick={() => setShowRepasseModal(true)}
                    />
                    <ReportCard
                      title="Relatório Financeiro"
                      desc="Resumo de recebimentos, repasses e pendências."
                      onClick={() => window.print()}
                    />
                    <ReportCard
                      title="Relatório de Contratos"
                      desc="Lista de contratos ativos, vencimentos e reajustes."
                      onClick={() => window.print()}
                    />
                    <ReportCard
                      title="Relatório de Imóveis"
                      desc="Inventário detalhado de todas as propriedades."
                      onClick={() => window.print()}
                    />
                    <ReportCard
                      title="Relatório de Inquilinos"
                      desc="Dados de contato e situação contratual dos locatários."
                      onClick={() => window.print()}
                    />
                    <ReportCard
                      title="Relatório de Proprietários"
                      desc="Lista de proprietários e seus respectivos imóveis."
                      onClick={() => window.print()}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                              fetchData(); // Trigger re-render
                            }}
                            className={`w-12 h-6 rounded-full transition-colors relative ${localStorage.getItem('imobi_auto_backup') === 'true' ? 'bg-emerald-500' : 'bg-slate-300'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${localStorage.getItem('imobi_auto_backup') === 'true' ? 'left-7' : 'left-1'}`}></div>
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={triggerBackup}
                            className="flex items-center justify-center space-x-2 bg-slate-900 text-white p-4 rounded-2xl hover:bg-slate-800 transition-all"
                          >
                            <Download size={20} />
                            <span className="font-bold">Baixar .DB</span>
                          </button>
                          <button
                            onClick={() => {
                              const data = { owners, tenants, properties, contracts, payments };
                              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `backup_completo_${new Date().toISOString().split('T')[0]}.json`;
                              a.click();
                            }}
                            className="flex items-center justify-center space-x-2 bg-white border border-slate-200 text-slate-700 p-4 rounded-2xl hover:bg-slate-50 transition-all"
                          >
                            <RefreshCw size={20} />
                            <span className="font-bold">Exportar JSON</span>
                          </button>
                        </div>

                        <p className="text-[10px] text-slate-400 text-center">
                          Último backup: {localStorage.getItem('imobi_last_backup') ? new Date(localStorage.getItem('imobi_last_backup')!).toLocaleString('pt-BR') : 'Nunca'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-emerald-900 text-white p-8 rounded-3xl relative overflow-hidden">
                      <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-2">Dica de Automação</h3>
                        <p className="text-emerald-100 text-sm leading-relaxed mb-6">
                          Para um backup 100% automático na sua máquina sem precisar abrir o navegador, você pode configurar um script simples no seu Windows ou Linux que chama nossa API de backup diariamente.
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

                  <div className="bg-white p-8 rounded-3xl border border-slate-200 print:border-none print:p-0">
                    <div className="flex justify-between items-center mb-8 print:hidden">
                      <h3 className="text-xl font-bold">Pré-visualização do Relatório</h3>
                      <button
                        onClick={() => window.print()}
                        className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors"
                      >
                        <Printer size={18} />
                        <span>Imprimir Relatório</span>
                      </button>
                    </div>

                    <div id="report-content" className="space-y-8">
                      <div className="text-center border-b pb-6">
                        <h2 className="text-2xl font-bold text-emerald-600">ImobiGestão - Relatório Geral</h2>
                        <p className="text-slate-500">Gerado em: {new Date().toLocaleDateString('pt-BR')}</p>
                      </div>

                      <section>
                        <h4 className="text-lg font-bold mb-4 text-slate-800 border-l-4 border-emerald-500 pl-3">Resumo Financeiro</h4>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase font-bold">Total Recebido</p>
                            <p className="text-xl font-bold text-emerald-600">R$ {(Array.isArray(payments) ? payments : []).filter(p => p.status === 'paid').reduce((acc, curr) => acc + (curr.amount_paid || 0), 0).toLocaleString('pt-BR')}</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase font-bold">Total Repassado</p>
                            <p className="text-xl font-bold text-blue-600">R$ {(Array.isArray(payments) ? payments : []).filter(p => p.status === 'paid').reduce((acc, curr) => acc + (curr.transfer_amount || 0), 0).toLocaleString('pt-BR')}</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase font-bold">Contratos Ativos</p>
                            <p className="text-xl font-bold text-slate-800">{contracts.length}</p>
                          </div>
                        </div>
                      </section>

                      <section>
                        <h4 className="text-lg font-bold mb-4 text-slate-800 border-l-4 border-emerald-500 pl-3">Imóveis e Ocupação</h4>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left border-b">
                              <th className="pb-2">Endereço</th>
                              <th className="pb-2">Tipo</th>
                              <th className="pb-2">Proprietário</th>
                              <th className="pb-2">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {properties.map(p => {
                              const isOccupied = contracts.some(c => c.property_id === p.id);
                              return (
                                <tr key={p.id}>
                                  <td className="py-2">{p.address}</td>
                                  <td className="py-2">{p.type}</td>
                                  <td className="py-2">{p.owner_name}</td>
                                  <td className="py-2">
                                    <span className={isOccupied ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                                      {isOccupied ? 'Alugado' : 'Disponível'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </section>

                      <section>
                        <h4 className="text-lg font-bold mb-4 text-slate-800 border-l-4 border-emerald-500 pl-3">Próximos Vencimentos</h4>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left border-b">
                              <th className="pb-2">Inquilino</th>
                              <th className="pb-2">Vencimento</th>
                              <th className="pb-2">Valor</th>
                              <th className="pb-2">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {(Array.isArray(payments) ? payments : []).filter(p => p.status === 'pending').slice(0, 10).map(p => (
                              <tr key={p.id}>
                                <td className="py-2">{p.tenant_name}</td>
                                <td className="py-2">{formatDate(p.due_date)}</td>
                                <td className="py-2">R$ {p.amount_paid?.toLocaleString('pt-BR') || '1.000,00'}</td>
                                <td className="py-2 text-orange-500 font-bold">Pendente</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </section>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

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
                  <div className="grid grid-cols-2 gap-4">
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
                      // Sugestão: Aluguel - Taxa Adm + Encargos + Extras
                      const suggested = (rent * (1 - adminTax / 100)) + charges + extras;
                      const input = document.querySelector('input[name="transfer_amount"]') as HTMLInputElement;
                      if (input) input.value = suggested.toFixed(2);
                    }
                  }}
                  className="absolute right-2 top-8 text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors font-bold"
                >
                  Sugerir Valor
                </button>
              </div>

              {/* Resumo do Cálculo */}
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
                        <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-emerald-600">
                          <span>Total Sugerido:</span>
                          <span>R$ {(rent - adminValue + charges + extras).toLocaleString('pt-BR')}</span>
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
                            onClick={() => handleAsaasTransfer(p.id)}
                            disabled={!owner?.bank_code}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition-all ${owner?.bank_code
                              ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-100'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              }`}
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
