require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

async function alterKelasColumn() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log("Mengubah panjang kolom kelas...");

  try {
    // Cek struktur kolom saat ini
    console.log("1. Checking current column structure...");
    const { data: currentStructure, error: structureError } =
      await supabase.rpc("sql", {
        query: `
          SELECT column_name, data_type, character_maximum_length 
          FROM information_schema.columns 
          WHERE table_name = 'tb_siswa' 
          AND column_name = 'kelas'
        `,
      });

    if (structureError) {
      console.log("Error checking structure:", structureError);
    } else {
      console.log("Current structure:", currentStructure);
    }

    // Ubah panjang kolom kelas menjadi varchar(50)
    console.log("\n2. Altering column length...");
    const { data, error } = await supabase.rpc("sql", {
      query: "ALTER TABLE tb_siswa ALTER COLUMN kelas TYPE varchar(50);",
    });

    if (error) {
      console.log("❌ Error altering column:", error.message);
      console.log("Error details:", error);

      // Coba dengan pendekatan alternatif
      console.log("\n3. Trying alternative approach...");
      const { data: altData, error: altError } = await supabase.rpc("sql", {
        query: "ALTER TABLE tb_siswa ALTER COLUMN kelas TYPE TEXT;",
      });

      if (altError) {
        console.log("❌ Alternative approach also failed:", altError.message);
      } else {
        console.log("✅ Successfully changed kelas column to TEXT type");
      }
    } else {
      console.log("✅ Successfully changed kelas column to varchar(50)");
    }

    // Verifikasi perubahan
    console.log("\n4. Verifying changes...");
    const { data: newStructure, error: verifyError } = await supabase.rpc(
      "sql",
      {
        query: `
          SELECT column_name, data_type, character_maximum_length 
          FROM information_schema.columns 
          WHERE table_name = 'tb_siswa' 
          AND column_name = 'kelas'
        `,
      }
    );

    if (verifyError) {
      console.log("Error verifying:", verifyError);
    } else {
      console.log("New structure:", newStructure);
    }

    // Test dengan data panjang
    console.log("\n5. Testing with long class name...");
    const testData = {
      nisn: "test" + Date.now(),
      nama_siswa: "Test Student",
      kelas: "XII Teknik Komputer dan Jaringan", // 32 chars
      tahun_pelajaran: "2025-2026",
      semester: "Ganjil",
      id_dudi: 1,
      nama_dudi: "Test Company",
      id_guru: "siska",
      nama_guru: "Test Teacher",
    };

    const { data: testResult, error: testError } = await supabase
      .from("tb_siswa")
      .insert([testData])
      .select();

    if (testError) {
      console.log("❌ Test insert failed:", testError.message);
    } else {
      console.log("✅ Test insert successful with long kelas name!");

      // Clean up test data
      await supabase.from("tb_siswa").delete().eq("nisn", testData.nisn);
      console.log("🗑️ Test data cleaned up");
    }
  } catch (error) {
    console.error("Script error:", error);
  }
}

alterKelasColumn();
