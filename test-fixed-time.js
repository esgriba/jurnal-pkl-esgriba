const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://fftitljrhntxtejhelja.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmdGl0bGpyaG50eHRlamhlbGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MzYwNzAsImV4cCI6MjA3MDQxMjA3MH0._avLy91UYFyM79AWeBd1ZKgJH9GKbp3K-fXVMXaXXVY";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFixedTimeFormat() {
  console.log("Testing fixed time format...");

  const { data: siswaData } = await supabase
    .from("tb_siswa")
    .select("*")
    .eq("nisn", "1234")
    .single();

  if (!siswaData) {
    console.error("No siswa data found");
    return;
  }

  const now = new Date();
  const today = now.toISOString().split("T")[0];

  // Use proper time format for PostgreSQL
  const timeForDB = now.toTimeString().split(" ")[0]; // Gets HH:MM:SS format

  console.log("Time for DB:", timeForDB);
  console.log("Today:", today);

  const testData = {
    nisn: siswaData.nisn,
    nama_siswa: siswaData.nama_siswa,
    kelas: siswaData.kelas,
    lokasi: "Test Location: -6.200000, 106.816666",
    id_dudi: siswaData.id_dudi,
    nama_dudi: siswaData.nama_dudi,
    tanggal: today,
    status: "Hadir",
    keterangan: "Test with fixed time format",
    id_guru: siswaData.id_guru,
    nama_guru: siswaData.nama_guru,
    jam_absensi: timeForDB,
  };

  console.log("Test data:", testData);

  try {
    const { data, error } = await supabase
      .from("tb_absensi")
      .insert(testData)
      .select()
      .single();

    if (error) {
      console.error("Insert error:", error);
    } else {
      console.log("✅ Insert successful:", data);
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

testFixedTimeFormat();
