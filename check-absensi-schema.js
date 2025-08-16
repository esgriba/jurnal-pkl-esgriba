const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://fftitljrhntxtejhelja.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmdGl0bGpyaG50eHRlamhlbGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MzYwNzAsImV4cCI6MjA3MDQxMjA3MH0._avLy91UYFyM79AWeBd1ZKgJH9GKbp3K-fXVMXaXXVY";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAbsensiSchema() {
  console.log("Checking tb_absensi table structure...");

  try {
    // First check if table exists and get sample data
    const { data, error } = await supabase
      .from("tb_absensi")
      .select("*")
      .limit(1);

    if (error) {
      console.error("Error accessing tb_absensi:", error);
      return;
    }

    if (data && data.length > 0) {
      console.log("tb_absensi table columns found:");
      console.log(Object.keys(data[0]));
      console.log("Sample data:", data[0]);
    } else {
      console.log("tb_absensi table exists but is empty");

      // Try to get table structure from a failed insert
      try {
        const { error: insertError } = await supabase
          .from("tb_absensi")
          .insert({ test: "test" });

        if (insertError) {
          console.log(
            "Insert error (shows required fields):",
            insertError.message
          );
        }
      } catch (e) {
        console.log("Error details:", e);
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

checkAbsensiSchema();
