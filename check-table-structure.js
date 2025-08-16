require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

async function checkTableStructure() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Query sample data dari tb_siswa untuk melihat struktur
    const { data, error } = await supabase
      .from("tb_siswa")
      .select("*")
      .limit(1);

    if (error) {
      console.error("Error:", error);
      return;
    }

    console.log("Sample data tb_siswa:");
    console.log(data);

    // Coba insert data dengan nama panjang untuk test
    console.log("\nTesting insert with long names...");

    const testData = {
      nisn: "1234567890123", // 13 chars
      nama_siswa: "FITRIANA EKA AMELIA TESTING VERY LONG NAME", // 43 chars
      kelas: "XII Akuntansi",
      tahun_pelajaran: "2025-2026",
      semester: "Ganjil",
      id_dudi: 1,
      nama_dudi: "Bank Mandiri KCP Wongsorejo",
      id_guru: "siska",
      nama_guru: "Siska Purwanti, S.E.",
    };

    console.log("Test data:", testData);
  } catch (error) {
    console.error("Connection error:", error);
  }
}

checkTableStructure();
