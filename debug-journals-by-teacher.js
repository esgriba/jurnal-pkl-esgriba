const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkTodayJournalsByTeacher() {
  try {
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    console.log("Checking journals by teacher for:", today);

    // Get all journals for today
    const { data: todayJournals, error: jurnalError } = await supabase
      .from("tb_jurnal")
      .select("nisn, nama_siswa, nama_guru")
      .eq("tanggal", today);

    if (jurnalError) {
      console.error("Error:", jurnalError);
      return;
    }

    console.log("Total journals today:", todayJournals?.length || 0);

    // Group by teacher
    const byTeacher = {};
    todayJournals?.forEach((j) => {
      if (!byTeacher[j.nama_guru]) {
        byTeacher[j.nama_guru] = [];
      }
      byTeacher[j.nama_guru].push(j.nama_siswa);
    });

    console.log("\nJournals by teacher:");
    Object.entries(byTeacher).forEach(([teacher, students]) => {
      console.log(`- ${teacher}: ${students.length} journals`);
      students.forEach((student) => {
        console.log(`  * ${student}`);
      });
    });
  } catch (err) {
    console.error("Error:", err);
  }
}

checkTodayJournalsByTeacher();
