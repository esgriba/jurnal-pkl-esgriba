// Script to check jurnal table structure
const { createClient } = require("@supabase/supabase-js");
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

async function checkJurnalSchema() {
  try {
    console.log("Checking tb_jurnal table structure...");

    const { data, error } = await supabase
      .from("tb_jurnal")
      .select("*")
      .limit(1);

    if (error) {
      console.error("Error querying tb_jurnal:", error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log("tb_jurnal table columns found:");
      console.log(Object.keys(data[0]));

      console.log("\nSample data:");
      console.log("lokasi:", data[0].lokasi);
      console.log("id_jurnal:", data[0].id_jurnal);
    } else {
      console.log("No data found in tb_jurnal table");
    }
  } catch (error) {
    console.error("Error checking schema:", error.message);
  }
}

checkJurnalSchema();
