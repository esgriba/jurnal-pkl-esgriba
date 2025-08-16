const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://fftitljrhntxtejhelja.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmdGl0bGpyaG50eHRlamhlbGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MzYwNzAsImV4cCI6MjA3MDQxMjA3MH0._avLy91UYFyM79AWeBd1ZKgJH9GKbp3K-fXVMXaXXVY";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAbsensiInsert() {
  console.log("Testing absensi insertion...");

  // Get test data first
  const { data: siswaData } = await supabase
    .from("tb_siswa")
    .select("*")
    .eq("nisn", "1234")
    .single();

  if (!siswaData) {
    console.error("No siswa data found");
    return;
  }

  console.log("Using siswa data:", siswaData);

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const time = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const testData = {
    nisn: siswaData.nisn,
    nama_siswa: siswaData.nama_siswa,
    kelas: siswaData.kelas,
    lokasi: "Test Location: -6.200000, 106.816666",
    id_dudi: siswaData.id_dudi,
    nama_dudi: siswaData.nama_dudi,
    tanggal: today,
    status: "Hadir",
    keterangan: "Test attendance",
    id_guru: siswaData.id_guru,
    nama_guru: siswaData.nama_guru,
    jam_absensi: time,
  };

  console.log("Attempting to insert:", testData);

  try {
    const { data, error } = await supabase
      .from("tb_absensi")
      .insert(testData)
      .select()
      .single();

    if (error) {
      console.error("Insert error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
    } else {
      console.log("✅ Insert successful:", data);
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }

  // Check if there are any existing records for today
  console.log("\nChecking existing records for today...");
  const { data: existing, error: existingError } = await supabase
    .from("tb_absensi")
    .select("*")
    .eq("nisn", siswaData.nisn)
    .eq("tanggal", today);

  if (existingError) {
    console.error("Error checking existing:", existingError);
  } else {
    console.log("Existing records:", existing);
  }
}

testAbsensiInsert();
