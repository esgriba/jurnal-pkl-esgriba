const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkGuruSiswaRelations() {
  try {
    // Get a sample guru
    const { data: guru, error: guruError } = await supabase
      .from("tb_guru")
      .select("*")
      .limit(1);

    if (guruError) {
      console.error("Error fetching guru:", guruError);
      return;
    }

    if (!guru || guru.length === 0) {
      console.log("No guru found");
      return;
    }

    const sampleGuru = guru[0];
    console.log("Sample guru:", sampleGuru);

    // Get siswa under this guru
    const { data: siswa, error: siswaError } = await supabase
      .from("tb_siswa")
      .select("nisn, nama_siswa")
      .eq("id_guru", sampleGuru.id_guru);

    if (siswaError) {
      console.error("Error fetching siswa:", siswaError);
      return;
    }

    console.log("Siswa under " + sampleGuru.nama_guru + ":");
    console.log(siswa);

    if (siswa && siswa.length > 0) {
      const nisnList = siswa.map((s) => s.nisn);

      // Check today's journals for these students
      const today = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());

      console.log("Looking for journals on date:", today);

      const { data: todayJournals, error: jurnalError } = await supabase
        .from("tb_jurnal")
        .select("nisn, nama_siswa, tanggal")
        .in("nisn", nisnList)
        .eq("tanggal", today);

      if (jurnalError) {
        console.error("Error fetching journals:", jurnalError);
        return;
      }

      console.log("Journals for " + today + " by these students:");
      console.log(todayJournals);
      console.log("Count: " + (todayJournals?.length || 0));

      // Also check all journals from these students
      const { data: allJournals, error: allError } = await supabase
        .from("tb_jurnal")
        .select("nisn, nama_siswa, tanggal")
        .in("nisn", nisnList)
        .order("tanggal", { ascending: false })
        .limit(5);

      if (allError) {
        console.error("Error fetching all journals:", allError);
        return;
      }

      console.log("\nRecent journals from these students:");
      allJournals?.forEach((j) => {
        console.log(`- ${j.nama_siswa} (${j.nisn}): ${j.tanggal}`);
      });
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

checkGuruSiswaRelations();
