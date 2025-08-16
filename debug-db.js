// Debug script untuk test koneksi database
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://fftitljrhntxtejhelja.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmdGl0bGpyaG50eHRlamhlbGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MzYwNzAsImV4cCI6MjA3MDQxMjA3MH0._avLy91UYFyM79AWeBd1ZKgJH9GKbp3K-fXVMXaXXVY";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabase() {
  console.log("Testing Supabase connection...");

  try {
    // Test koneksi dengan query sederhana
    const { data, error } = await supabase.from("tb_user").select("*").limit(5);

    if (error) {
      console.error("Error:", error);
      return;
    }

    console.log("Success! Users found:", data.length);
    console.log("Sample data:", data);
  } catch (err) {
    console.error("Connection failed:", err);
  }
}

testDatabase();
