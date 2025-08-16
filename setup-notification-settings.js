const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://wglqrlcnhjdhzlbqhxqp.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnbHFybGNuaGpkaHpsYnFoeHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2NjczNjIsImV4cCI6MjA0OTI0MzM2Mn0.dYHJ-NpuBmI6-h6-kDohQwNNYYNOgMjS_Nm3v6J2_kw";

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupNotificationSettings() {
  try {
    // Try to insert default settings (will create table if doesn't exist)
    const { data, error } = await supabase
      .from("notification_settings")
      .upsert({
        id: 1,
        notification_time: "08:00",
        is_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      console.error("Error creating notification settings:", error);
    } else {
      console.log("Notification settings created successfully:", data);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

setupNotificationSettings();
