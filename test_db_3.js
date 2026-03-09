import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function testAll() {
    const tables = ['brokers', 'owners', 'tenants', 'properties', 'property_owners', 'contracts', 'payments', 'inspections', 'maintenances'];
    for (const table of tables) {
        let query = supabase.from(table).select("*").limit(1);
        if (table === 'properties') {
            query = supabase.from("properties").select("*, owners!properties_owner_id_fkey(name), property_owners(owner_id, share_percent, owners(*))").limit(1);
        } else if (table === 'contracts') {
            query = supabase.from("contracts").select("*, properties(address), tenants(name), owners:properties(owners!properties_owner_id_fkey(name)), brokers(name)").limit(1);
        } else if (table === 'payments') {
            query = supabase.from("payments").select("*, contracts(tenants(name), properties(address))").limit(1);
        } else if (table === 'inspections') {
            query = supabase.from("inspections").select("*, contracts(properties(address))").limit(1);
        } else if (table === 'maintenances') {
            query = supabase.from("maintenances").select("*, properties(address)").limit(1);
        }

        const { data, error } = await query;
        if (error) {
            console.log(`[ERRO] ${table}:`, error.message, error.details || '');
        } else {
            console.log(`[OK] ${table}:`, data.length, "registros (testados)");
        }
    }
}

testAll();
