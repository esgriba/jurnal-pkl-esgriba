const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://fftitljrhntxtejhelja.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmdGl0bGpyaG50eHRlamhlbGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MzYwNzAsImV4cCI6MjA3MDQxMjA3MH0._avLy91UYFyM79AWeBd1ZKgJH9GKbp3K-fXVMXaXXVY";

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugSiswaData() {
  console.log("Testing siswa data fetch...");

  // Test the exact same query from the dashboard
  const username = "1234"; // This is the test user from debug-db.js

  console.log("\n1. Testing user data fetch...");
  const { data: userData, error: userError } = await supabase
    .from("tb_user")
    .select("nama")
    .eq("username", username)
    .single();

  if (userError) {
    console.error("Error fetching user data:", userError);
    return;
  }

  console.log("User data found:", userData);

  console.log("\n2. Testing siswa data fetch...");
  const { data: siswa, error } = await supabase
    .from("tb_siswa")
    .select("*")
    .eq("nama_siswa", userData.nama)
    .single();

  if (error) {
    console.error("Error fetching siswa data:", error);
    return;
  }

  console.log("Siswa data found:", siswa);

  console.log("\n3. Checking all siswa records...");
  const { data: allSiswa, error: allError } = await supabase
    .from("tb_siswa")
    .select("*");

  if (allError) {
    console.error("Error fetching all siswa:", allError);
  } else {
    console.log("All siswa records:", allSiswa);
  }
}

debugSiswaData();
