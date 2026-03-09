import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function test() {
    const { data, error } = await supabase
        .from("properties")
        .select("*, owners!properties_owner_id_fkey(name), property_owners(owner_id, share_percent, owners(*))");

    if (error) {
        console.error("ERRO SUPABASE:", error);
    } else {
        console.log("PROPRIEDADES:", data.length);
    }
}

test();
