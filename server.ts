import express from "express";
import session from "express-session";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// Auth Middleware for other API routes
const authMiddleware = async (req: any, res: any, next: any) => {
  // Allow all non-API routes (frontend assets, etc.)
  if (!req.path.startsWith('/api')) {
    return next();
  }

  // Allow public and auth API routes
  if (req.path.startsWith('/api/auth') || req.path === '/api/public/db-status') {
    return next();
  }

  const session = req.session as any;
  if (!session?.user) {
    return res.status(401).json({ error: "Não autorizado. Por favor, faça login." });
  }
  next();
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log(`\n[SUPABASE] Conectando a: ${supabaseUrl}`);
  if (!supabaseKey) {
    console.error("[SUPABASE] ERRO: SUPABASE_ANON_KEY ou SUPABASE_SERVICE_ROLE_KEY não configurada.");
  }

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
  seedAdmin();

  app.use(express.json());

  // Session configuration
  app.set('trust proxy', 1); // trust first proxy
  app.use(session({
    secret: "imobi-gestao-secret-key",
    resave: false,
    saveUninitialized: false,
    name: 'imobi_session',
    proxy: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Only secure in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Public diagnostic route
  app.get("/api/public/db-status", async (req, res) => {
    try {
      const { data, error } = await supabase.from("users").select("id").limit(1);
      if (error) {
        return res.json({
          connected: false,
          error: error.message,
          code: error.code,
          hint: "Verifique se a tabela 'users' existe no Supabase."
        });
      }
      res.json({ connected: true, hasUsers: data.length > 0 });
    } catch (e: any) {
      res.json({ connected: false, error: e.message });
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
    const { email, password } = req.body;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        // Get user profile from our table
        const { data: profile } = await supabase.from("users").select("*").eq("username", email).maybeSingle();

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
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ error: "Erro ao fazer logout" });
      res.json({ message: "Logout realizado com sucesso" });
    });
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
            rent_value,
            tenants (name, asaas_id),
            properties (address)
          )
        `)
        .eq("id", paymentId)
        .single();

      if (error || !payment) return res.status(404).json({ error: "Pagamento não encontrado" });

      const tenant = payment.contracts?.tenants;
      const property = payment.contracts?.properties;

      if (!tenant?.asaas_id) return res.status(400).json({ error: "Inquilino não sincronizado com Asaas" });

      const asaasPayment = await asaasFetch("/payments", {
        method: "POST",
        body: JSON.stringify({
          customer: tenant.asaas_id,
          billingType: "UNDEFINED",
          value: payment.amount_paid || payment.contracts?.rent_value,
          dueDate: payment.due_date,
          description: `Aluguel - ${property?.address}`,
          externalReference: payment.id.toString(),
        }),
      });

      await supabase.from("payments")
        .update({ asaas_id: asaasPayment.id, asaas_status: asaasPayment.status })
        .eq("id", paymentId);

      res.json(asaasPayment);
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
              owners (
                name, document, bank_code, bank_agency, bank_account, bank_account_digit, bank_account_type, pix_key
              )
            )
          )
        `)
        .eq("id", paymentId)
        .eq("status", "paid")
        .single();

      if (error || !payment) return res.status(404).json({ error: "Pagamento não encontrado ou não está pago." });

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

  // Webhook Asaas para Conciliação Automática
  app.post("/api/asaas/webhook", express.json(), async (req, res) => {
    const { event, payment } = req.body;
    console.log(`Webhook Asaas: Evento ${event} para cobrança ${payment.id}`);

    if (event === "PAYMENT_CONFIRMED" || event === "PAYMENT_RECEIVED") {
      const { data: localPayment, error } = await supabase
        .from("payments")
        .select("*, contracts(fees, broker_commission_percent)")
        .eq("asaas_id", payment.id)
        .single();

      if (localPayment && !error) {
        const amountPaid = payment.value;
        const commissionPercent = localPayment.contracts?.fees || 0;
        const commissionValue = (amountPaid * commissionPercent) / 100;

        const brokerCommissionPercent = localPayment.contracts?.broker_commission_percent || 0;
        const brokerCommissionValue = (amountPaid * brokerCommissionPercent) / 100;

        const transferAmount = amountPaid - commissionValue - brokerCommissionValue;

        await supabase.from("payments")
          .update({
            status: 'paid',
            received_date: new Date().toISOString().split('T')[0],
            amount_paid: amountPaid,
            commission_value: commissionValue,
            broker_commission_value: brokerCommissionValue,
            transfer_amount: transferAmount,
            asaas_status: 'RECEIVED'
          })
          .eq("id", localPayment.id);

        console.log(`Pagamento ${localPayment.id} conciliado via Webhook.`);
      }
    } else if (event === "PAYMENT_OVERDUE") {
      await supabase.from("payments").update({ asaas_status: 'OVERDUE' }).eq("asaas_id", payment.id);
    }

    res.status(200).send("OK");
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
    const { data, error } = await supabase.from("inspections").insert([{ contract_id, type, date, description, photos_link, status: status || 'pending' }]).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: data[0].id });
  });

  app.put("/api/inspections/:id", async (req, res) => {
    const { id } = req.params;
    const { contract_id, type, date, description, photos_link, status } = req.body;
    const { error } = await supabase.from("inspections").update({ contract_id, type, date, description, photos_link, status }).eq("id", id);
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
    const { data, error } = await supabase.from("maintenances").insert([{ property_id, description, request_date, estimated_cost, actual_cost, status: status || 'pending', paid_by, photos_link }]).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: data[0].id });
  });

  app.put("/api/maintenances/:id", async (req, res) => {
    const { id } = req.params;
    const { property_id, description, request_date, estimated_cost, actual_cost, status, paid_by, photos_link } = req.body;
    const { error } = await supabase.from("maintenances").update({ property_id, description, request_date, estimated_cost, actual_cost, status, paid_by, photos_link }).eq("id", id);
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
    const { name, email, phone, document } = req.body;
    const { data, error } = await supabase.from("owners").insert([{ name, email, phone, document }]).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: data[0].id });
  });

  app.put("/api/owners/:id", async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, document } = req.body;
    const { error } = await supabase.from("owners").update({ name, email, phone, document }).eq("id", id);
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
      .select("*, owners(name), property_owners(owner_id, share_percent, owners(*))");

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
    const { address, type, size, rooms, bathrooms, garage_spaces, pets_allowed, usage_type, owner_id, secondary_owners, document_links } = req.body;
    const { data, error } = await supabase.from("properties").insert([{ address, type, size, rooms, bathrooms, garage_spaces, pets_allowed, usage_type, owner_id, document_links }]).select();
    if (error) return res.status(500).json({ error: error.message });

    const propertyId = data[0].id;

    if (Array.isArray(secondary_owners) && secondary_owners.length > 0) {
      const poData = secondary_owners.map(so => ({
        property_id: propertyId,
        owner_id: so.owner_id,
        share_percent: so.share_percent || 0
      }));
      await supabase.from("property_owners").insert(poData);
    }

    res.json({ id: propertyId });
  });

  app.put("/api/properties/:id", async (req, res) => {
    const { id } = req.params;
    const { address, type, size, rooms, bathrooms, garage_spaces, pets_allowed, usage_type, owner_id, secondary_owners, document_links } = req.body;
    const { error } = await supabase.from("properties").update({ address, type, size, rooms, bathrooms, garage_spaces, pets_allowed, usage_type, owner_id, document_links }).eq("id", id);
    if (error) return res.status(500).json({ error: error.message });

    // Update secondary owners
    await supabase.from("property_owners").delete().eq("property_id", id);
    if (Array.isArray(secondary_owners) && secondary_owners.length > 0) {
      const poData = secondary_owners.map(so => ({
        property_id: id,
        owner_id: so.owner_id,
        share_percent: so.share_percent || 0
      }));
      await supabase.from("property_owners").insert(poData);
    }

    res.json({ success: true });
  });

  // Contracts
  app.get("/api/contracts", async (req, res) => {
    const { data, error } = await supabase
      .from("contracts")
      .select("*, properties(address), tenants(name), owners:properties(owners(name)), brokers(name)");

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
      property_id, tenant_id, start_date, end_date, rent_value, due_day,
      adjustment_index, admin_tax, charges, extra_charges, transfer_value,
      guarantee_type, guarantee_value, guarantee_payment_date, guarantee_return_date,
      water_installation, electricity_installation, gas_installation,
      broker_id, broker_commission_percent, agency_commission_value,
      document_links, iptu_status, condo_status, last_adjustment_date, next_adjustment_date
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
      property_id, tenant_id, start_date, end_date, rent_value, due_day,
      adjustment_index, admin_tax, charges, extra_charges, transfer_value,
      guarantee_type, guarantee_value, guarantee_payment_date, guarantee_return_date,
      water_installation, electricity_installation, gas_installation,
      broker_id, broker_commission_percent, agency_commission_value,
      document_links, iptu_status, condo_status, last_adjustment_date, next_adjustment_date
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
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
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
      res.status(500).json({ error: e.message });
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
