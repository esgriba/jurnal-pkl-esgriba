const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://fftitljrhntxtejhelja.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmdGl0bGpyaG50eHRlamhlbGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MzYwNzAsImV4cCI6MjA3MDQxMjA3MH0._avLy91UYFyM79AWeBd1ZKgJH9GKbp3K-fXVMXaXXVY";

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  console.log("Checking available tables...");

  const tables = [
    "tb_absensi",
    "absensi",
    "tb_user",
    "tb_siswa",
    "tb_jurnal",
    "tb_guru",
    "tb_dudi",
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select("*").limit(1);

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(
          `✅ ${table}: exists, ${data ? data.length : 0} sample records`
        );
        if (data && data.length > 0) {
          console.log(`   Columns: ${Object.keys(data[0]).join(", ")}`);
        }
      }
    } catch (e) {
      console.log(`❌ ${table}: ${e.message}`);
    }
  }
}

listTables();
