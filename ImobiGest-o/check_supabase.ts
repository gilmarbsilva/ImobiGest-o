import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "";

async function checkConnection() {
    console.log("--- Diagnóstico de Conexão Supabase ---");
    console.log(`URL: ${supabaseUrl}`);
    console.log(`Chave configurada: ${supabaseKey ? "Sim (Anon Key)" : "Não"}`);

    if (!supabaseUrl || !supabaseKey) {
        console.error("ERRO: SUPABASE_URL ou SUPABASE_ANON_KEY não encontradas no .env");
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        console.log("\n1. Testando conectividade básica...");
        // Tenta ler uma tabela que deve existir
        const { data: users, error: usersError } = await supabase.from("users").select("id").limit(1);

        if (usersError) {
            console.error("❌ Erro ao acessar tabela 'users':", usersError.message);
            if (usersError.code === 'PGRST116' || usersError.message.includes('relation "public.users" does not exist')) {
                console.error("   HINT: A tabela 'users' parece não existir. Execute o script 'supabase_schema.sql' no painel do Supabase.");
            }
        } else {
            console.log("✅ Tabela 'users' acessível.");
        }

        const tables = ['brokers', 'owners', 'tenants', 'properties', 'contracts', 'payments'];
        console.log("\n2. Verificando outras tabelas principais:");

        for (const table of tables) {
            const { count, error } = await supabase.from(table).select("*", { count: 'exact', head: true });
            if (error) {
                console.error(`❌ ${table.padEnd(10)}: Erro (${error.message})`);
            } else {
                console.log(`✅ ${table.padEnd(10)}: OK (${count} registros)`);
            }
        }

        console.log("\n3. Testando Auth:");
        const { data: authData, error: authError } = await supabase.auth.getSession();
        if (authError) {
            console.error("❌ Erro no serviço de Auth:", authError.message);
        } else {
            console.log("✅ Serviço de Auth respondendo corretamente.");
        }

    } catch (e: any) {
        console.error("\n❌ Erro inesperado durante o diagnóstico:", e.message);
    }
}

checkConnection();
