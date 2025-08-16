require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

async function safeAlterKelasColumn() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log("=== SAFE ALTER KELAS COLUMN ===\n");

  try {
    // Step 1: Get view definition
    console.log("Step 1: Getting view definition...");
    const { data: viewDef, error: viewError } = await supabase
      .from("pg_views")
      .select("definition")
      .eq("viewname", "v_user_complete")
      .single();

    if (viewError) {
      console.log("❌ Error getting view definition:", viewError.message);
      console.log(
        "View might not exist or different name. Checking all views..."
      );

      // Check all views that might reference tb_siswa
      const { data: allViews, error: allViewsError } = await supabase
        .from("pg_views")
        .select("viewname, definition")
        .ilike("definition", "%tb_siswa%");

      if (allViewsError) {
        console.log("❌ Error checking views:", allViewsError.message);
        return;
      }

      console.log("Views that reference tb_siswa:");
      allViews?.forEach((view) => {
        console.log(`- ${view.viewname}`);
      });

      if (allViews && allViews.length > 0) {
        console.log(
          "\n⚠️  You need to manually handle these views before altering the column."
        );
        console.log("Use Supabase Dashboard SQL Editor to:");
        console.log("1. DROP the views");
        console.log("2. ALTER the column");
        console.log("3. Recreate the views");
      }
      return;
    }

    console.log("✅ Found view definition");
    console.log("View definition:", viewDef.definition);

    console.log("\n⚠️  MANUAL STEPS REQUIRED:");
    console.log("1. Copy the view definition above");
    console.log("2. Go to Supabase Dashboard → SQL Editor");
    console.log("3. Run: DROP VIEW v_user_complete;");
    console.log(
      "4. Run: ALTER TABLE tb_siswa ALTER COLUMN kelas TYPE varchar(50);"
    );
    console.log("5. Recreate the view with the definition above");
  } catch (error) {
    console.error("Script error:", error);

    // Alternative: Try direct SQL execution if permissions allow
    console.log("\nTrying alternative approach...");
    console.log("If you have direct SQL access, run these commands in order:");
    console.log("");
    console.log("-- 1. Backup and drop view");
    console.log(
      "CREATE TEMP TABLE view_backup AS SELECT * FROM v_user_complete LIMIT 0;"
    );
    console.log("DROP VIEW IF EXISTS v_user_complete;");
    console.log("");
    console.log("-- 2. Alter column");
    console.log("ALTER TABLE tb_siswa ALTER COLUMN kelas TYPE varchar(50);");
    console.log("");
    console.log("-- 3. Recreate view (adjust based on your actual view)");
    console.log("CREATE VIEW v_user_complete AS");
    console.log("SELECT u.*, s.nisn, s.nama_siswa, s.kelas, s.tahun_pelajaran");
    console.log("FROM tb_user u LEFT JOIN tb_siswa s ON u.id = s.user_id;");
  }
}

safeAlterKelasColumn();
