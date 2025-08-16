// Simple test to simulate the exact dashboard flow
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://fftitljrhntxtejhelja.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmdGl0bGpyaG50eHRlamhlbGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MzYwNzAsImV4cCI6MjA3MDQxMjA3MH0._avLy91UYFyM79AWeBd1ZKgJH9GKbp3K-fXVMXaXXVY";

const supabase = createClient(supabaseUrl, supabaseKey);

async function simulateDashboardFlow() {
  console.log("Simulating dashboard flow...");

  // Simulate the exact localStorage user data
  const userData = {
    id: 16,
    username: "1234",
    nama: "Rizky",
    role: "siswa",
  };

  console.log("User from localStorage:", userData);

  // Test the fetchSiswaData function exactly as in the component
  const fetchSiswaData = async (username) => {
    try {
      console.log("Fetching data for username:", username);

      // First get user data to get the nama
      const { data: userDbData, error: userError } = await supabase
        .from("tb_user")
        .select("nama")
        .eq("username", username)
        .single();

      if (userError) {
        console.error("Error fetching user data:", userError);
        console.error(
          "User error details:",
          JSON.stringify(userError, null, 2)
        );
        return;
      }

      console.log("User data found:", userDbData);

      // Then find siswa data by matching nama_siswa with user nama
      const { data: siswa, error } = await supabase
        .from("tb_siswa")
        .select("*")
        .eq("nama_siswa", userDbData.nama)
        .single();

      if (error) {
        console.error("Error fetching siswa data:", error);
        console.error("Siswa error details:", JSON.stringify(error, null, 2));
        return;
      }

      console.log("Siswa data found:", siswa);

      // Fetch jurnal count using the NISN from siswa data
      console.log("Fetching jurnal count for NISN:", siswa.nisn);
      const { count } = await supabase
        .from("tb_jurnal")
        .select("*", { count: "exact", head: true })
        .eq("nisn", siswa.nisn);

      console.log("Jurnal count:", count);

      // Fetch today's attendance
      const today = new Date().toISOString().split("T")[0];
      console.log("Fetching attendance for date:", today, "NISN:", siswa.nisn);

      const { data: attendanceData, error: attendanceError } = await supabase
        .from("tb_absensi")
        .select("*")
        .eq("nisn", siswa.nisn)
        .eq("tanggal", today)
        .single();

      if (attendanceError) {
        console.log(
          "No attendance found (expected if not yet checked in):",
          attendanceError
        );
      }

      if (!attendanceError && attendanceData) {
        console.log("Attendance data found:", attendanceData);
      }

      console.log("✅ Dashboard data fetch completed successfully!");
    } catch (error) {
      console.error("Unexpected error in fetchSiswaData:", error);
      console.error("Error type:", typeof error);
      console.error("Error details:", JSON.stringify(error, null, 2));

      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
    }
  };

  await fetchSiswaData(userData.username);
}

simulateDashboardFlow();
