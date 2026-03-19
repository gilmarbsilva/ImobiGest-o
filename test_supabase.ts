import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key (length):", supabaseKey.length);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
  const { data, error } = await supabase.from("owners").select("*");
  if (error) {
    console.error("Fetch Error:", error.message);
  } else {
    console.log("Fetch Success. Rows found:", data.length);
    console.log("Data:", data);
  }
}

testFetch();
