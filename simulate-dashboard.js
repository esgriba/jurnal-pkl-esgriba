const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function simulateGuruDashboard() {
  try {
    // Test with "rohim" - who should have 4 journals today
    const username = "rohim";

    console.log("Simulating dashboard for teacher:", username);

    // Step 1: Get siswa yang dibimbing (like in dashboard)
    const { data: siswaData, error: siswaError } = await supabase
      .from("tb_siswa")
      .select("nisn, nama_siswa, kelas, nama_dudi")
      .eq("id_guru", username);

    if (siswaError) throw siswaError;
    console.log("Students assigned to this teacher:", siswaData?.length || 0);

    if (siswaData && siswaData.length > 0) {
      const nisnList = siswaData.map((s) => s.nisn);
      console.log("NISN list:", nisnList);

      // Step 2: Get all journals from these students
      const { data: jurnalData, error: jurnalError } = await supabase
        .from("tb_jurnal")
        .select("*")
        .in("nisn", nisnList)
        .order("tanggal", { ascending: false });

      if (jurnalError) throw jurnalError;
      console.log(
        "Total journals from these students:",
        jurnalData?.length || 0
      );

      // Step 3: Calculate today's journals (like in dashboard)
      const today = new Date();
      const jakartaDate = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(today);

      console.log("Jakarta date for comparison:", jakartaDate);

      const todayJournals =
        jurnalData?.filter((j) => j.tanggal === jakartaDate) || [];

      console.log("Journals from these students TODAY:", todayJournals.length);

      if (todayJournals.length > 0) {
        console.log("Today journal details:");
        todayJournals.forEach((j) => {
          console.log(`- ${j.nama_siswa} (${j.nisn}): ${j.tanggal}`);
        });
      }

      // This should match what the dashboard shows
      console.log("\n=== DASHBOARD STATS ===");
      console.log("Total Siswa:", siswaData.length);
      console.log("Total Jurnal:", jurnalData?.length || 0);
      console.log("Jurnal Hari Ini:", todayJournals.length);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

simulateGuruDashboard();
