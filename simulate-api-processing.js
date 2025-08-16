require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

// Data dari log error sebelumnya
const excelData = [
  {
    NISN: "0074612857",
    "Nama Siswa": "DINA RIZA AYU MATUSSHOLEHA",
    Kelas: "XII Akuntansi",
    "Tahun Pelajaran": "2025-2026",
    Semester: "Ganjil",
    "ID DUDI": 1,
    "Nama DUDI": "Bank Mandiri KCP Wongsorejo",
    "ID Guru": "siska",
    "Nama Guru": "Siska Purwanti, S.E.",
  },
  {
    NISN: "0071347347",
    "Nama Siswa": "YULI YATIMAH",
    Kelas: "XII Akuntansi",
    "Tahun Pelajaran": "2025-2026",
    Semester: "Ganjil",
    "ID DUDI": 1,
    "Nama DUDI": "Bank Mandiri KCP Wongsorejo",
    "ID Guru": "siska",
    "Nama Guru": "Siska Purwanti, S.E.",
  },
];

async function simulateAPIProcessing() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const processedData = [];
  const errors = [];

  console.log("Simulating API processing...\n");

  // Process each row (same as API)
  for (let i = 0; i < excelData.length; i++) {
    const row = excelData[i];

    console.log(`Processing row ${i + 1}:`);
    console.log("Raw Excel row:", row);

    try {
      // Validate required fields (same as API)
      const requiredFields = {
        nisn: row.NISN || row.nisn || row.Nisn,
        nama_siswa: row["Nama Siswa"] || row.nama_siswa || row.Nama || row.nama,
        kelas: row.Kelas || row.kelas || row.Class,
        tahun_pelajaran:
          row["Tahun Pelajaran"] || row.tahun_pelajaran || "2024/2025",
        semester: row.Semester || row.semester || "Ganjil",
        id_dudi: row["ID DUDI"] || row.id_dudi || row.ID_DUDI,
        nama_dudi: row["Nama DUDI"] || row.nama_dudi || row.DUDI,
        id_guru: row["ID Guru"] || row.id_guru || row.ID_Guru,
        nama_guru: row["Nama Guru"] || row.nama_guru || row.Guru,
      };

      console.log("Processed fields:", requiredFields);
      console.log("Field lengths:");
      Object.keys(requiredFields).forEach((key) => {
        const value = requiredFields[key];
        const length = typeof value === "string" ? value.length : "N/A";
        console.log(`  - ${key}: ${length} chars: "${value}"`);
      });

      processedData.push(requiredFields);
      console.log("✅ Row processed successfully\n");
    } catch (error) {
      console.log("❌ Error processing row:", error.message);
      errors.push({
        row: i + 2,
        error: `Error processing row: ${error.message}`,
        data: row,
      });
    }
  }

  // Test batch insert
  if (processedData.length > 0) {
    console.log("Testing batch insert...");
    console.log(`Inserting ${processedData.length} rows`);

    try {
      const { data, error: insertError } = await supabase
        .from("tb_siswa")
        .insert(processedData)
        .select();

      if (insertError) {
        console.log("❌ Batch insert error:", insertError.message);
        console.log("Error code:", insertError.code);
        console.log("Error details:", insertError.details);

        // Try single inserts to find problematic row
        console.log("\nTrying individual inserts to find problematic row...");
        for (let i = 0; i < processedData.length; i++) {
          const singleData = processedData[i];
          console.log(`\nTesting single insert for row ${i + 1}:`);

          try {
            const { data: singleResult, error: singleError } = await supabase
              .from("tb_siswa")
              .insert([singleData])
              .select();

            if (singleError) {
              console.log(`❌ Row ${i + 1} failed:`, singleError.message);
              console.log("Problematic data:", singleData);
            } else {
              console.log(`✅ Row ${i + 1} success`);
              // Clean up
              await supabase
                .from("tb_siswa")
                .delete()
                .eq("nisn", singleData.nisn);
            }
          } catch (err) {
            console.log(`❌ Row ${i + 1} exception:`, err.message);
          }
        }
      } else {
        console.log("✅ Batch insert successful");
        console.log(`Inserted ${data?.length || 0} rows`);

        // Clean up
        const nisns = processedData.map((d) => d.nisn);
        await supabase.from("tb_siswa").delete().in("nisn", nisns);
        console.log("🗑️ Cleaned up test data");
      }
    } catch (error) {
      console.log("❌ Batch insert exception:", error.message);
    }
  }
}

simulateAPIProcessing();
