import express from "express";
import cookieSession from "cookie-session";
// import { createServer as createViteServer } from "vite"; // Removed from top-level for Vercel compatibility

import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";

// Lazy-loaded client to avoid crashes if keys are missing at build time
let _supabaseClient: any = null;
const supabase = {
  get auth() {
    if (!_supabaseClient) _supabaseClient = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "");
    return _supabaseClient.auth;
  },
  from(table: string) {
    if (!_supabaseClient) _supabaseClient = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "");
    return _supabaseClient.from(table);
  },
  get storage() {
    if (!_supabaseClient) _supabaseClient = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "");
    return _supabaseClient.storage;
  }
};

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// Auth Middleware for other API routes
const authMiddleware = async (req: any, res: any, next: any) => {
  // Allow all non-API routes (frontend assets, etc.)
  if (!req.path.startsWith('/api')) {
    return next();
  }

  // Allow public routes
  if (req.path.startsWith('/api/auth') || req.path === '/api/public/db-status' || req.path === '/api/me') {
    return next();
  }

  const session = req.session as any;
  if (!session?.user) {
    return res.status(401).json({ error: "Não autorizado. Por favor, faça login." });
  }
  next();
};

export async function createApp() {
  const app = express();
  const currentSupabaseUrl = process.env.SUPABASE_URL || "";

  console.log(`\n[APP] Inicializando aplicação (Node: ${process.version}, Vercel: ${!!process.env.VERCEL})`);
  console.log(`[SUPABASE] Destino: ${currentSupabaseUrl}`);

  // Debug middleware to see what's reaching Express
  app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
      console.log(`[REQUEST] ${req.method} ${req.url}`);
    }
    next();
  });

  // Seed default admin user if not exists
  const seedAdmin = async () => {
    try {
      const { data: users, error } = await supabase.from("users").select("id").eq("username", ADMIN_USERNAME).limit(1);

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('public.users')) {
          console.error("\n[ERRO CRÍTICO] A tabela 'users' não foi encontrada no Supabase.");
          console.error("Por favor, execute o script 'supabase_schema.sql' no SQL Editor do seu painel Supabase.\n");
        } else {
          console.error("Erro ao verificar usuário admin:", error.message);
        }
        return;
      }

      if (!users || users.length === 0) {
        console.log(`Semeando usuário admin padrão (${ADMIN_USERNAME})...`);
        await supabase.from("users").insert([
          { username: ADMIN_USERNAME, name: "Administrador", password: ADMIN_PASSWORD }
        ]);
      }
    } catch (e) {
      console.error("Erro inesperado ao semear admin:", e);
    }
  };
  seedAdmin().catch(e => console.error("Admin seed failed passively:", e.message));

  app.use(express.json());

  // Session configuration optimized for Vercel Serverless
  app.set('trust proxy', 1); // trust first proxy
  app.use(cookieSession({
    name: 'imobi_session',
    keys: ['imobi-gestao-secret-key-1', 'imobi-gestao-secret-key-2'],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: process.env.NODE_ENV === 'production', // Only secure in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }));

  // Very simple health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", env: process.env.NODE_ENV, vercel: !!process.env.VERCEL, time: new Date().toISOString() });
  });

  // File Upload
  app.post("/api/upload", upload.single("file"), async (req: any, res: any) => {
    try {
      if (!req.file) return res.status(400).json({ error: "Nenhum arquivo enviado." });

      const file = req.file;
      const fileExt = path.extname(file.originalname);
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { data, error } = await supabase.storage
        .from("documents")
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          cacheControl: "3600",
          upsert: false
        });

      if (error) {
        return res.status(500).json({ error: `Erro no upload: ${error.message}. Certifique-se que o bucket 'documents' existe no Supabase.` });
      }

      const { data: { publicUrl } } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      res.json({ url: publicUrl });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Helper to get Supabase client
  const getSupabase = () => {
    if (!_supabaseClient) {
      _supabaseClient = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "");
    }
    return supabase; // Return the existing wrapper object
  };

  app.get("/api/public/db-status", async (req, res) => {
    try {
      const supabase = getSupabase(); // Use localized client check
      console.log("[DB-STATUS] Verificando conexão com Supabase...");
      const currentUrl = process.env.SUPABASE_URL || "";
      const currentKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";

      if (!currentUrl || !currentKey) {
        return res.status(500).json({ connected: false, error: "Servidor sem chaves de API configuradas." });
      }
      const { data, error } = await supabase.from("users").select("id").limit(1);
      if (error) {
        console.error("[DB-STATUS] Erro:", error.message);
        return res.json({
          connected: false,
          error: error.message,
          code: error.code,
          hint: "Verifique se a tabela 'users' existe no Supabase."
        });
      }
      res.json({ connected: true, hasUsers: data.length > 0 });
    } catch (e: any) {
      console.error("[DB-STATUS] Erro inesperado:", e.message);
      res.status(500).json({ connected: false, error: e.message });
    }
  });

  app.get("/api/me", async (req, res) => {
    const session = req.session as any;
    if (session?.user) {
      res.json(session.user);
    } else {
      res.status(401).json({ error: "Não autenticado" });
    }
  });

  // Auth Routes
  app.post("/api/auth/signup", async (req, res) => {
    const { email, password, name } = req.body;
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (error) throw error;

      // Also create a record in our custom users table if needed
      if (data.user) {
        await supabase.from("users").insert([
          { id: data.user.id, username: email, name: name, password: 'SUPABASE_AUTH' }
        ]);
      }

      res.json({ message: "Usuário criado com sucesso. Verifique seu e-mail." });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    try {
      // Use the username (which stores the email) for authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password
      });
      if (error) throw error;

      if (data.user) {
        // Get user profile from our table using the username
        const { data: profile } = await supabase.from("users").select("*").eq("username", username).maybeSingle();

        const userData = {
          id: data.user.id,
          email: data.user.email,
          name: profile?.name || data.user.user_metadata?.name || "Usuário"
        };

        (req.session as any).user = userData;
        res.json(userData);
      }
    } catch (e: any) {
      res.status(401).json({ error: e.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session = null;
    res.json({ message: "Logout realizado com sucesso" });
  });

  // Apply Auth Middleware to all subsequent routes
  app.use(authMiddleware);

  // Asaas Integration
  const asaasFetch = async (endpoint: string, options: any = {}) => {
    const apiKey = process.env.ASAAS_API_KEY;
    const apiUrl = process.env.ASAAS_API_URL || "https://www.asaas.com/api/v3";

    if (!apiKey) {
      throw new Error("ASAAS_API_KEY não configurada no ambiente.");
    }

    const response = await fetch(`${apiUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "access_token": apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.description || "Erro na comunicação com Asaas");
    }

    return response.json();
  };

  app.post("/api/asaas/sync-tenant/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { data: tenant, error } = await supabase.from("tenants").select("*").eq("id", id).single();

      if (error || !tenant) return res.status(404).json({ error: "Inquilino não encontrado" });

      let asaasId = tenant.asaas_id;

      if (!asaasId) {
        // Criar cliente no Asaas
        const customer = await asaasFetch("/customers", {
          method: "POST",
          body: JSON.stringify({
            name: tenant.name,
            email: tenant.email,
            mobilePhone: tenant.phone,
            cpfCnpj: tenant.document,
            externalReference: tenant.id.toString(),
          }),
        });
        asaasId = customer.id;
        await supabase.from("tenants").update({ asaas_id: asaasId }).eq("id", id);
      }

      res.json({ asaas_id: asaasId });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/asaas/create-payment/:paymentId", async (req, res) => {
    try {
      const { paymentId } = req.params;
      const { data: payment, error } = await supabase
        .from("payments")
        .select(`
          *,
          contracts (
            fees,
            broker_commission_percent,
            rent_value,
            tenants (name, email, document, phone, asaas_id),
            properties (
              address,
              owners!properties_owner_id_fkey (id, name, document, bank_code, bank_agency, bank_account, bank_account_digit, bank_account_type)
            ),
            brokers (id, name, document, pix_key)
          )
        `)
        .eq("id", paymentId)
        .single();

      if (error) console.error("Erro Supabase:", error.message, error.details);
      if (error || !payment) return res.status(404).json({ error: `Pagamento não encontrado: ${error?.message || ''}` });

      const contract = payment.contracts;
      const tenant = contract?.tenants;
      const property = contract?.properties;
      const owner = property?.owners; // owners!properties_owner_id_fkey usually returns a single object if it's a direct foreign key.
      const broker = contract?.brokers;

      if (!tenant?.asaas_id) return res.status(400).json({ error: "Inquilino não sincronizado com Asaas" });

      const totalValue = payment.amount_paid || contract?.rent_value || 0;
      const agencyFeePercent = contract?.fees || 0;
      const brokerFeePercent = contract?.broker_commission_percent || 0;
      const debtsValue = payment.debts_value || 0;

      const split: any[] = [];

      // Split for Owner (Rent minus Agency Fee and Debts)
      if (owner && owner.bank_account) {
        const ownerValue = totalValue - (totalValue * agencyFeePercent / 100) - (totalValue * brokerFeePercent / 100) - debtsValue;
        if (ownerValue > 0) {
          split.push({
            bankAccount: {
              bank: { code: owner.bank_code },
              ownerName: owner.name,
              ownerCpfCnpj: owner.document,
              agency: owner.bank_agency,
              account: owner.bank_account,
              accountDigit: owner.bank_account_digit,
              bankAccountType: owner.bank_account_type || 'CHECKING_ACCOUNT'
            },
            fixedValue: ownerValue
          });
        }
      }

      // Split for Broker (Commission)
      if (broker && broker.pix_key && brokerFeePercent > 0) {
        const brokerValue = totalValue * brokerFeePercent / 100;
        split.push({
          pixAddressKey: broker.pix_key,
          fixedValue: brokerValue
        });
      }

      const paymentBody: any = {
        customer: tenant.asaas_id,
        billingType: "UNDEFINED",
        value: totalValue,
        dueDate: payment.due_date,
        description: `Aluguel - ${property?.address}`,
        externalReference: payment.id.toString(),
        postalService: false,
        fine: { value: 2, type: 'PERCENTAGE' },
        interest: { value: 0.33, type: 'PERCENTAGE' },
      };

      if (split.length > 0) {
        paymentBody.split = split;
      }

      const asaasPayment = await asaasFetch("/payments", {
        method: "POST",
        body: JSON.stringify(paymentBody),
      });

      await supabase.from("payments")
        .update({ asaas_id: asaasPayment.id, asaas_status: asaasPayment.status })
        .eq("id", paymentId);

      res.json(asaasPayment);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/asaas/create-subscription/:contractId", async (req, res) => {
    try {
      const { contractId } = req.params;
      const { data: contract, error } = await supabase
        .from("contracts")
        .select(`
          *,
          tenants (name, asaas_id),
          properties (address)
        `)
        .eq("id", contractId)
        .single();

      if (error || !contract) return res.status(404).json({ error: "Contrato não encontrado" });
      if (!contract.tenants?.asaas_id) return res.status(400).json({ error: "Inquilino não sincronizado" });

      const subscription = await asaasFetch("/subscriptions", {
        method: "POST",
        body: JSON.stringify({
          customer: contract.tenants.asaas_id,
          billingType: "UNDEFINED",
          value: contract.rent_value,
          nextDueDate: contract.start_date, // Ou lógica baseada no dia de vencimento
          cycle: "MONTHLY",
          description: `Assinatura de Aluguel - ${contract.properties?.address}`,
          externalReference: contract.id.toString(),
          endDate: contract.end_date,
          fine: { value: 2, type: 'PERCENTAGE' },
          interest: { value: 0.33, type: 'PERCENTAGE' },
        }),
      });

      await supabase.from("contracts").update({ asaas_subscription_id: subscription.id }).eq("id", contractId);
      res.json(subscription);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/asaas/check-subscription/:contractId", async (req, res) => {
    try {
      const { contractId } = req.params;
      const { data: contract, error } = await supabase.from("contracts").select("asaas_subscription_id").eq("id", contractId).single();
      
      if (error || !contract || !contract.asaas_subscription_id) {
        return res.status(404).json({ error: "Contrato sem assinatura ou não encontrado." });
      }

      const asaasSub = await asaasFetch(`/subscriptions/${contract.asaas_subscription_id}`);
      
      if (asaasSub.status === "DELETED" || asaasSub.status === "INACTIVE" || asaasSub.deleted) {
        await supabase.from("contracts").update({ asaas_subscription_id: null }).eq("id", contractId);
        return res.json({ active: false, message: "Assinatura estava inativa no Asaas e foi limpa localmente." });
      }

      res.json({ active: true, status: asaasSub.status });
    } catch (e: any) {
      if (e.message && e.message.includes("not found")) {
        // Se retornar 404 do Asaas, significa que foi excluída lá
        const { contractId } = req.params;
        await supabase.from("contracts").update({ asaas_subscription_id: null }).eq("id", contractId);
        return res.json({ active: false, message: "Assinatura estava excluída no Asaas e foi limpa localmente." });
      }
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/asaas/check-payment/:paymentId", async (req, res) => {
    try {
      const { paymentId } = req.params;
      const { data: payment, error } = await supabase.from("payments").select("*").eq("id", paymentId).single();
      if (error || !payment || !payment.asaas_id) return res.status(404).json({ error: "Pagamento não encontrado ou sem ID Asaas" });

      const asaasPayment = await asaasFetch(`/payments/${payment.asaas_id}`);
      
      // Update local status if changed
      const statusMap: any = {
        'RECEIVED': 'paid',
        'CONFIRMED': 'paid',
        'OVERDUE': 'pending',
        'PENDING': 'pending',
        'REFUNDED': 'pending'
      };

      const updates: any = { asaas_status: asaasPayment.status };
      if (statusMap[asaasPayment.status] === 'paid' && payment.status !== 'paid') {
        updates.status = 'paid';
        updates.received_date = asaasPayment.paymentDate || new Date().toISOString().split('T')[0];
        updates.amount_paid = asaasPayment.value;
        
        const { data: contract } = await supabase.from("contracts").select("fees, broker_commission_percent").eq("id", payment.contract_id).single();
        if (contract) {
          const comm = (asaasPayment.value * (contract.fees || 0)) / 100;
          const bComm = (asaasPayment.value * (contract.broker_commission_percent || 0)) / 100;
          updates.commission_value = comm;
          updates.broker_commission_value = bComm;
          // transferAmount = gross - agencyFee - brokerFee - debts (IPTU/Condo)
          updates.transfer_amount = asaasPayment.value - comm - bComm - (payment.debts_value || 0);
        }
      } else if (asaasPayment.status !== payment.asaas_status) {
        // Just update the status if not paid
        await supabase.from("payments").update({ asaas_status: asaasPayment.status }).eq("id", paymentId);
      }

      if (Object.keys(updates).length > 1) {
        await supabase.from("payments").update(updates).eq("id", paymentId);
      }

      res.json({ ...asaasPayment, localStatus: updates.status || payment.status });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/asaas/transfer/:paymentId", async (req, res) => {
    try {
      const { paymentId } = req.params;
      const { data: payment, error } = await supabase
        .from("payments")
        .select(`
          *,
          contracts (
            properties (
              owners!properties_owner_id_fkey (
                name, document, bank_code, bank_agency, bank_account, bank_account_digit, bank_account_type, pix_key
              )
            )
          )
        `)
        .eq("id", paymentId)
        .eq("status", "paid")
        .single();

      if (error) console.error("Erro Supabase:", error.message, error.details);
      if (error || !payment) return res.status(404).json({ error: `Pagamento não encontrado ou não está pago: ${error?.message || ''}` });

      const owner = payment.contracts?.properties?.owners;

      if (!payment.transfer_amount || payment.transfer_amount <= 0) return res.status(400).json({ error: "Valor de repasse inválido." });
      if (payment.transfer_status === 'done') return res.status(400).json({ error: "Repasse já realizado." });

      const transferBody: any = {
        value: payment.transfer_amount,
        bankAccount: {
          bank: { code: owner.bank_code },
          ownerName: owner.name,
          ownerCpfCnpj: owner.document,
          agency: owner.bank_agency,
          account: owner.bank_account,
          accountDigit: owner.bank_account_digit,
          bankAccountType: owner.bank_account_type || 'CHECKING_ACCOUNT'
        },
        operationType: "BANK_ACCOUNT"
      };

      const asaasTransfer = await asaasFetch("/transfers", {
        method: "POST",
        body: JSON.stringify(transferBody),
      });

      await supabase.from("payments")
        .update({ transfer_status: 'done', transfer_date: new Date().toISOString().split('T')[0] })
        .eq("id", paymentId);

      res.json(asaasTransfer);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/asaas/transfer-broker/:paymentId", async (req, res) => {
    try {
      const { paymentId } = req.params;
      const { data: payment, error } = await supabase
        .from("payments")
        .select(`
          *,
          contracts (
            brokers (
              name, document, pix_key
            )
          )
        `)
        .eq("id", paymentId)
        .eq("status", "paid")
        .single();

      if (error || !payment) return res.status(404).json({ error: "Pagamento não encontrado ou não está pago." });
      
      const broker = payment.contracts?.brokers;
      if (!broker) return res.status(400).json({ error: "Contrato sem corretor associado." });
      if (!payment.broker_commission_value || payment.broker_commission_value <= 0) return res.status(400).json({ error: "Valor de comissão do corretor zerado." });
      if (payment.broker_transfer_status === 'done') return res.status(400).json({ error: "Repasse ao corretor já realizado." });

      const transferBody: any = {
        value: payment.broker_commission_value,
        operationType: "PIX",
        pixAddressKey: broker.pix_key,
        externalReference: `BROKER_${paymentId}`
      };

      if (!broker.pix_key) return res.status(400).json({ error: "Corretor sem Chave PIX cadastrada." });

      const asaasTransfer = await asaasFetch("/transfers", {
        method: "POST",
        body: JSON.stringify(transferBody),
      });

      await supabase.from("payments")
        .update({ 
          broker_transfer_status: 'done', 
          broker_transfer_date: new Date().toISOString().split('T')[0],
          broker_transfer_id: asaasTransfer.id 
        })
        .eq("id", paymentId);

      res.json(asaasTransfer);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Webhook Asaas para Conciliação Automática e Gestão de Ciclo de Vida
  app.post("/api/asaas/webhook", express.json(), async (req, res) => {
    try {
      const { event, payment, subscription } = req.body;
      console.log(`Webhook Asaas: Evento ${event} recebido.`);

      if (event === "SUBSCRIPTION_DELETED" && subscription) {
        await supabase.from("contracts").update({ asaas_subscription_id: null }).eq("asaas_subscription_id", subscription.id);
        console.log(`Assinatura ${subscription.id} excluída no Asaas. Contrato atualizado.`);
        return res.status(200).send("OK");
      }

      if (payment) {
        console.log(`Cobrança associada: ${payment.id} (Ref: ${payment.externalReference})`);
        
        if (event === "PAYMENT_CONFIRMED" || event === "PAYMENT_RECEIVED") {
          let localPaymentId = payment.externalReference;
        
        // Se for um pagamento de assinatura, o externalReference pode não estar presente no pagamento individual
        // ou pode ser diferente. O Asaas envia o subscriptionId.
        if (!localPaymentId && payment.subscription) {
          console.log(`Pagamento de assinatura detectado: ${payment.subscription}`);
          // Lógica para encontrar ou criar o registro de pagamento local baseado na assinatura
          const { data: contract } = await supabase.from("contracts").select("id, fees, broker_commission_percent").eq("asaas_subscription_id", payment.subscription).single();
          if (contract) {
            // Verificar se já existe um registro de pagamento para este vencimento
            const { data: existingPayment } = await supabase.from("payments")
              .select("id")
              .eq("contract_id", contract.id)
              .eq("due_date", payment.dueDate)
              .maybeSingle();

            if (existingPayment) {
              localPaymentId = existingPayment.id.toString();
            } else {
              // Criar novo registro de pagamento se não existir (conciliação retroativa)
              const { data: newPayment } = await supabase.from("payments").insert([{
                contract_id: contract.id,
                due_date: payment.dueDate,
                status: 'paid',
                asaas_id: payment.id,
                asaas_status: 'RECEIVED'
              }]).select().single();
              localPaymentId = newPayment.id.toString();
            }
          }
        }

        if (localPaymentId) {
          const { data: localPayment, error } = await supabase
            .from("payments")
            .select("*, contracts(fees, broker_commission_percent)")
            .eq("id", localPaymentId)
            .single();

          if (localPayment && !error) {
            const amountPaid = payment.value;
            const commissionPercent = localPayment.contracts?.fees || 0;
            const commissionValue = (amountPaid * commissionPercent) / 100;

            const brokerCommissionPercent = localPayment.contracts?.broker_commission_percent || 0;
            const brokerCommissionValue = (amountPaid * brokerCommissionPercent) / 100;

            const debtsValue = localPayment.debts_value || 0;
            const transferAmount = amountPaid - commissionValue - brokerCommissionValue - debtsValue;

            await supabase.from("payments")
              .update({
                status: 'paid',
                received_date: payment.paymentDate || new Date().toISOString().split('T')[0],
                amount_paid: amountPaid,
                commission_value: commissionValue,
                broker_commission_value: brokerCommissionValue,
                transfer_amount: transferAmount,
                asaas_status: 'RECEIVED',
                payment_method: payment.billingType
              })
              .eq("id", localPayment.id);

            console.log(`Pagamento ${localPayment.id} conciliado via Webhook. Repasse: ${transferAmount}`);
          }
        }
      } else if (event === "PAYMENT_OVERDUE") {
        await supabase.from("payments").update({ asaas_status: 'OVERDUE' }).eq("asaas_id", payment.id);
        console.log(`Pagamento ${payment.id} marcado como VENCIDO.`);
      } else if (event === "PAYMENT_DELETED") {
        await supabase.from("payments").update({ asaas_status: 'DELETED', status: 'pending' }).eq("asaas_id", payment.id);
        console.log(`Pagamento ${payment.id} excluído no Asaas.`);
      } else if (event === "PAYMENT_REFUNDED") {
        await supabase.from("payments").update({ asaas_status: 'REFUNDED', status: 'pending' }).eq("asaas_id", payment.id);
        console.log(`Pagamento ${payment.id} estornado.`);
      }
      }

      res.status(200).send("OK");
    } catch (e: any) {
      console.error(`Erro no processamento do Webhook Asaas: ${e.message}`);
      res.status(500).send("Internal Server Error");
    }
  });

  // Brokers
  app.get("/api/brokers", async (req, res) => {
    const { data, error } = await supabase.from("brokers").select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.post("/api/brokers", async (req, res) => {
    const { name, email, phone, document, pix_key } = req.body;
    const { data, error } = await supabase.from("brokers").insert([{ name, email, phone, document, pix_key }]).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: data[0].id });
  });

  app.put("/api/brokers/:id", async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, document, pix_key } = req.body;
    const { error } = await supabase.from("brokers").update({ name, email, phone, document, pix_key }).eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  // Inspections
  app.get("/api/inspections", async (req, res) => {
    const { data, error } = await supabase
      .from("inspections")
      .select("*, contracts(properties(address))");

    if (error) return res.status(500).json({ error: error.message });

    // Flatten the response to match expected format
    const formatted = data.map(i => ({
      ...i,
      address: i.contracts?.properties?.address
    }));
    res.json(formatted);
  });

  app.post("/api/inspections", async (req, res) => {
    const { contract_id, type, date, description, photos_link, status } = req.body;
    const { data, error } = await supabase.from("inspections").insert([{
      contract_id: Number(contract_id),
      type,
      date,
      description,
      photos_link,
      status: status || 'pending'
    }]).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: data[0].id });
  });

  app.put("/api/inspections/:id", async (req, res) => {
    const { id } = req.params;
    const { contract_id, type, date, description, photos_link, status } = req.body;
    const { error } = await supabase.from("inspections").update({
      contract_id: Number(contract_id),
      type,
      date,
      description,
      photos_link,
      status
    }).eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  // Maintenances
  app.get("/api/maintenances", async (req, res) => {
    const { data, error } = await supabase
      .from("maintenances")
      .select("*, properties(address)");

    if (error) return res.status(500).json({ error: error.message });

    const formatted = data.map(m => ({
      ...m,
      address: m.properties?.address
    }));
    res.json(formatted);
  });

  app.post("/api/maintenances", async (req, res) => {
    const { property_id, description, request_date, estimated_cost, actual_cost, status, paid_by, photos_link } = req.body;
    const { data, error } = await supabase.from("maintenances").insert([{
      property_id: Number(property_id),
      description,
      request_date,
      estimated_cost: Number(estimated_cost) || 0,
      actual_cost: Number(actual_cost) || 0,
      status: status || 'pending',
      paid_by,
      photos_link
    }]).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: data[0].id });
  });

  app.put("/api/maintenances/:id", async (req, res) => {
    const { id } = req.params;
    const { property_id, description, request_date, estimated_cost, actual_cost, status, paid_by, photos_link } = req.body;
    const { error } = await supabase.from("maintenances").update({
      property_id: Number(property_id),
      description,
      request_date,
      estimated_cost: Number(estimated_cost),
      actual_cost: Number(actual_cost),
      status,
      paid_by,
      photos_link
    }).eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  // Owners
  app.get("/api/owners", async (req, res) => {
    const { data, error } = await supabase.from("owners").select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.post("/api/owners", async (req, res) => {
    const { name, email, phone, document, bank_code, bank_agency, bank_account, bank_account_digit, bank_account_type, pix_key } = req.body;
    const { data, error } = await supabase.from("owners").insert([{
      name, email, phone, document,
      bank_code, bank_agency, bank_account, bank_account_digit, bank_account_type, pix_key
    }]).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: data[0].id });
  });

  app.put("/api/owners/:id", async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, document, bank_code, bank_agency, bank_account, bank_account_digit, bank_account_type, pix_key } = req.body;
    const { error } = await supabase.from("owners").update({
      name, email, phone, document,
      bank_code, bank_agency, bank_account, bank_account_digit, bank_account_type, pix_key
    }).eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  // Tenants
  app.get("/api/tenants", async (req, res) => {
    const { data, error } = await supabase.from("tenants").select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.post("/api/tenants", async (req, res) => {
    const { name, email, phone, document, history } = req.body;
    const { data, error } = await supabase.from("tenants").insert([{ name, email, phone, document, history }]).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: data[0].id });
  });

  app.put("/api/tenants/:id", async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, document, history } = req.body;
    const { error } = await supabase.from("tenants").update({ name, email, phone, document, history }).eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  // Properties
  app.get("/api/properties", async (req, res) => {
    const { data, error } = await supabase
      .from("properties")
      .select("*, owners!properties_owner_id_fkey(name), property_owners(owner_id, share_percent, owners(*))");

    if (error) return res.status(500).json({ error: error.message });

    const formatted = data.map(p => ({
      ...p,
      owner_name: p.owners?.name,
      secondary_owners: p.property_owners?.map((po: any) => ({
        ...po.owners,
        share_percent: po.share_percent
      }))
    }));
    res.json(formatted);
  });

  app.post("/api/properties", async (req, res) => {
    try {
      const {
        address,
        type,
        size,
        rooms,
        bathrooms,
        garage_spaces,
        pets_allowed,
        usage_type,
        owner_id,
        secondary_owners = [],
        document_links = null,
      } = req.body;

      // Validate required fields
      if (!address) {
        return res.status(400).json({ error: 'Campo "address" é obrigatório.' });
      }

      const { data, error } = await supabase.from("properties").insert([
        {
          address,
          type,
          size: size ? Number(size) : null,
          rooms: rooms ? Number(rooms) : 0,
          bathrooms: bathrooms ? Number(bathrooms) : 0,
          garage_spaces: garage_spaces ? Number(garage_spaces) : 0,
          pets_allowed: pets_allowed === '1' || pets_allowed === 1 || pets_allowed === true,
          usage_type: usage_type || 'individual',
          owner_id: owner_id ? Number(owner_id) : null,
          document_links,
        },
      ]).select();

      if (error) {
        console.error('[API] Erro ao inserir imóvel:', error);
        return res.status(500).json({ error: error.message });
      }

      const propertyId = data[0].id;

      // Process secondary owners if provided
      if (Array.isArray(secondary_owners) && secondary_owners.length > 0) {
        const poData = secondary_owners
          .filter((so: any) => so.owner_id && Number(so.owner_id) > 0)
          .map((so: any) => ({
            property_id: propertyId,
            owner_id: Number(so.owner_id),
            share_percent: Number(so.share_percent) || 0,
          }));
        if (poData.length > 0) {
          const { error: secError } = await supabase.from("property_owners").insert(poData);
          if (secError) {
            console.error('[API] Erro ao inserir proprietários secundários:', secError);
            return res.status(500).json({ error: secError.message });
          }
        }
      }

      return res.json({ id: propertyId });
    } catch (e: any) {
      console.error('[API] Exceção inesperada ao salvar imóvel:', e);
      return res.status(500).json({ error: e.message || 'Erro inesperado ao salvar imóvel.' });
    }
  });

  app.put("/api/properties/:id", async (req, res) => {
    const { id } = req.params;
    const { address, type, size, rooms, bathrooms, garage_spaces, pets_allowed, usage_type, owner_id, secondary_owners, document_links } = req.body;
    const { error } = await supabase.from("properties").update({
      address,
      type,
      size: size ? Number(size) : null,
      rooms: rooms ? Number(rooms) : 0,
      bathrooms: bathrooms ? Number(bathrooms) : 0,
      garage_spaces: garage_spaces ? Number(garage_spaces) : 0,
      pets_allowed: pets_allowed === '1' || pets_allowed === 1 || pets_allowed === true,
      usage_type,
      owner_id: owner_id ? Number(owner_id) : null,
      document_links
    }).eq("id", id);
    if (error) return res.status(500).json({ error: error.message });

    // Update secondary owners
    await supabase.from("property_owners").delete().eq("property_id", id);
    if (Array.isArray(secondary_owners) && secondary_owners.length > 0) {
      const poData = secondary_owners
        .filter((so: any) => so.owner_id && Number(so.owner_id) > 0)
        .map((so: any) => ({
          property_id: Number(id),
          owner_id: Number(so.owner_id),
          share_percent: Number(so.share_percent) || 0
        }));
      if (poData.length > 0) await supabase.from("property_owners").insert(poData);
    }

    res.json({ success: true });
  });

  // Bulk Generation of Payments
  app.post("/api/contracts/generate-payments", async (req, res) => {
    try {
      const { month, year } = req.body; // e.g., 3, 2024
      const { data: contracts, error } = await supabase
        .from("contracts")
        .select("*, tenants(name), properties(address)")
        .lte("start_date", `${year}-${month.toString().padStart(2, '0')}-28`)
        .gte("end_date", `${year}-${month.toString().padStart(2, '0')}-01`);

      if (error) throw error;

      const created = [];
      const contractsList = Array.isArray(contracts) ? contracts : [];

      for (const contract of contractsList) {
        const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;

        const { data: existing } = await supabase
          .from("payments")
          .select("id")
          .eq("contract_id", contract.id)
          .gte("due_date", startDate)
          .lte("due_date", endDate)
          .limit(1);

        if (!existing || existing.length === 0) {
          const dueDay = contract.due_day || 5;
          const dueDate = `${year}-${month.toString().padStart(2, '0')}-${dueDay.toString().padStart(2, '0')}`;

          const { data: p } = await supabase.from("payments").insert([{
            contract_id: contract.id,
            tenant_name: contract.tenants?.name,
            address: contract.properties?.address,
            due_date: dueDate,
            amount_paid: 0,
            status: 'pending',
            transfer_status: 'pending'
          }]).select();
          if (p) created.push(p[0]);
        }
      }

      res.json({ message: `Gerados ${created.length} novos pagamentos para ${month}/${year}.`, count: created.length });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Contracts
  app.get("/api/contracts", async (req, res) => {
    const { data, error } = await supabase
      .from("contracts")
      .select("*, properties(address), tenants(name), owners:properties(owners!properties_owner_id_fkey(name)), brokers(name)");

    if (error) return res.status(500).json({ error: error.message });

    const formatted = data.map(c => ({
      ...c,
      address: c.properties?.address,
      tenant_name: c.tenants?.name,
      owner_name: c.properties?.owners?.name,
      broker_name: c.brokers?.name
    }));
    res.json(formatted);
  });

  app.post("/api/contracts", async (req, res) => {
    const {
      property_id, tenant_id, start_date, end_date, rent_value, due_day,
      adjustment_index, admin_tax, charges, extra_charges, transfer_value,
      guarantee_type, guarantee_value, guarantee_payment_date, guarantee_return_date,
      water_installation, electricity_installation, gas_installation,
      broker_id, broker_commission_percent, agency_commission_value,
      document_links, iptu_status, condo_status, last_adjustment_date, next_adjustment_date
    } = req.body;

    const { data, error } = await supabase.from("contracts").insert([{
      property_id: Number(property_id),
      tenant_id: Number(tenant_id),
      start_date,
      end_date,
      rent_value: Number(rent_value),
      due_day: Number(due_day),
      adjustment_index,
      admin_tax: Number(admin_tax),
      charges: Number(charges) || 0,
      extra_charges,
      transfer_value: Number(transfer_value) || 0,
      guarantee_type,
      guarantee_value: Number(guarantee_value) || 0,
      guarantee_payment_date: guarantee_payment_date || null,
      guarantee_return_date: guarantee_return_date || null,
      water_installation,
      electricity_installation,
      gas_installation,
      broker_id: broker_id ? Number(broker_id) : null,
      broker_commission_percent: Number(broker_commission_percent) || 0,
      agency_commission_value: Number(agency_commission_value) || 0,
      document_links,
      iptu_status: iptu_status || 'pending',
      condo_status: condo_status || 'pending',
      last_adjustment_date: last_adjustment_date || null,
      next_adjustment_date: next_adjustment_date || null
    }]).select();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: data[0].id });
  });

  app.put("/api/contracts/:id", async (req, res) => {
    const { id } = req.params;
    const {
      property_id, tenant_id, start_date, end_date, rent_value, due_day,
      adjustment_index, admin_tax, charges, extra_charges, transfer_value,
      guarantee_type, guarantee_value, guarantee_payment_date, guarantee_return_date,
      water_installation, electricity_installation, gas_installation,
      broker_id, broker_commission_percent, agency_commission_value,
      document_links, iptu_status, condo_status, last_adjustment_date, next_adjustment_date
    } = req.body;

    const { error } = await supabase.from("contracts").update({
      property_id: Number(property_id),
      tenant_id: Number(tenant_id),
      start_date,
      end_date,
      rent_value: Number(rent_value),
      due_day: Number(due_day),
      adjustment_index,
      admin_tax: Number(admin_tax),
      charges: Number(charges),
      extra_charges,
      transfer_value: Number(transfer_value),
      guarantee_type,
      guarantee_value: Number(guarantee_value),
      guarantee_payment_date: guarantee_payment_date || null,
      guarantee_return_date: guarantee_return_date || null,
      water_installation,
      electricity_installation,
      gas_installation,
      broker_id: broker_id ? Number(broker_id) : null,
      broker_commission_percent: Number(broker_commission_percent),
      agency_commission_value: Number(agency_commission_value),
      document_links,
      iptu_status,
      condo_status,
      last_adjustment_date: last_adjustment_date || null,
      next_adjustment_date: next_adjustment_date || null
    }).eq("id", id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  // Payments
  app.get("/api/payments", async (req, res) => {
    const { data, error } = await supabase
      .from("payments")
      .select("*, contracts(tenants(name), properties(address))");

    if (error) return res.status(500).json({ error: error.message });

    const formatted = data.map(p => ({
      ...p,
      tenant_name: p.contracts?.tenants?.name,
      address: p.contracts?.properties?.address
    }));
    res.json(formatted);
  });

  app.post("/api/payments", async (req, res) => {
    const { contract_id, due_date, status } = req.body;
    const { data, error } = await supabase.from("payments").insert([{ contract_id, due_date, status: status || 'pending' }]).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: data[0].id });
  });

  app.patch("/api/payments/:id", async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const { error } = await supabase.from("payments").update(updates).eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // On Vercel, the dist folder is not in the same place as the API output usually.
    // Static files are handled by Vercel Rewrites anyway.
    if (!process.env.VERCEL) {
      app.use(express.static(path.join(__dirname, "dist")));
      app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "dist", "index.html"));
      });
    }
  }

  app.post("/api/import/:type", express.json(), async (req, res) => {
    const { type } = req.params;
    const items = req.body;

    if (!Array.isArray(items)) return res.status(400).json({ error: "Data must be an array" });

    try {
      const { error } = await supabase.from(type).insert(items);
      if (error) throw error;
      res.json({ success: true, count: items.length });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/db-check", async (req, res) => {
    const tables = ['brokers', 'owners', 'tenants', 'properties', 'property_owners', 'contracts', 'payments', 'inspections', 'maintenances'];
    const results: any = {};

    for (const table of tables) {
      const { error } = await supabase.from(table).select("count", { count: 'exact', head: true });
      results[table] = error ? `Erro: ${error.message}` : 'OK';
    }

    res.json(results);
  });

  // Delete Endpoints
  app.delete("/api/:type/:id", async (req, res) => {
    const { type, id } = req.params;
    const allowedTypes = ['owners', 'tenants', 'properties', 'contracts', 'payments', 'brokers', 'inspections', 'maintenances'];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ error: "Tipo inválido" });
    }

    try {
      const { error } = await supabase.from(type).delete().eq("id", id);
      if (error) throw error;
      res.json({ success: true });
    } catch (e: any) {
      if (e.code === '23503' || (e.message && e.message.includes('violates foreign key constraint'))) {
        return res.status(400).json({ error: "Não é possível excluir este registro pois ele está vinculado a outros itens no sistema (ex: Propriedades, Contratos, etc). Exclua ou desvincule as dependências primeiro." });
      }
      res.status(500).json({ error: e.message });
    }
  });

  return app;
}

// Only start the server if this file is run directly
// Only start the server if this file is run directly AND not on Vercel
const isDirectRun = (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('server.ts')) && !process.env.VERCEL;

if (isDirectRun) {
  createApp().then(app => {
    const PORT = Number(process.env.PORT) || 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}

