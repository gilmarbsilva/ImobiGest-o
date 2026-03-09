import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function test() {
    const { data, error } = await supabase
        .from("contracts")
        .select("*, properties(address), tenants(name), owners:properties(owners!properties_owner_id_fkey(name)), brokers(name)");

    if (error) {
        console.error("ERRO SUPABASE CONTRATOS:", error);
    } else {
        console.log("CONTRATOS:", data);
    }
}

test();
