// Simple script to check database table structure
const { createClient } = require("@supabase/supabase-js");

// Read environment variables directly from .env.local
const fs = require("fs");
const path = require("path");

function loadEnvLocal() {
  try {
    const envPath = path.join(__dirname, ".env.local");
    const envContent = fs.readFileSync(envPath, "utf8");
    const lines = envContent.split("\n");

    const env = {};
    lines.forEach((line) => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        env[match[1]] = match[2];
      }
    });

    return env;
  } catch (error) {
    console.error("Error reading .env.local:", error.message);
    return {};
  }
}

const env = loadEnvLocal();

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkTableSchema() {
  try {
    console.log("Checking tb_jurnal table structure...");

    // First, let's check if we can query the table
    const { data, error } = await supabase.from("tb_jurnal").select("*").limit(1);

    if (error) {
      console.error("Error querying tb_jurnal:", error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log("tb_jurnal table columns found:");
      console.log(Object.keys(data[0]));
      
      // Check if lokasi field contains coordinates
      console.log("Sample lokasi value:", data[0].lokasi);
    } else {
      console.log("No data found in tb_jurnal table");
    }

      // Check specifically for lokasi_map
      if ("lokasi_map" in data[0]) {
        console.log("✅ lokasi_map column EXISTS");
        console.log("Sample lokasi_map value:", data[0].lokasi_map);
      } else {
        console.log("❌ lokasi_map column MISSING");
      }
    } else {
      console.log("No data in tb_dudi table to check schema");
    }
  } catch (error) {
    console.error("Script error:", error);
  }
}

checkTableSchema();
