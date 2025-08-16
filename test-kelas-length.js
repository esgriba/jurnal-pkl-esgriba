require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

async function testKelasLength() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const testCases = [
    {
      name: "Kelas normal",
      kelas: "XII Akuntansi", // 13 chars
    },
    {
      name: "Kelas 23 chars",
      kelas: "Teknik Kendaraan Ringan", // 23 chars
    },
    {
      name: "Kelas 32 chars",
      kelas: "XII Teknik Komputer dan Jaringan", // 32 chars
    },
    {
      name: "Kelas 25 chars (test limit)",
      kelas: "XII Test Class Length 25", // 25 chars
    },
    {
      name: "Kelas 26 chars (over limit)",
      kelas: "XII Test Class Length 26C", // 26 chars
    },
  ];

  for (const testCase of testCases) {
    console.log(
      `\n${testCase.name}: "${testCase.kelas}" (${testCase.kelas.length} chars)`
    );

    const data = {
      nisn: `test${Math.random().toString().substr(2, 6)}`,
      nama_siswa: "Test Student",
      kelas: testCase.kelas,
      tahun_pelajaran: "2025-2026",
      semester: "Ganjil",
      id_dudi: 1,
      nama_dudi: "Test Company",
      id_guru: "siska",
      nama_guru: "Test Teacher",
    };

    try {
      const { data: result, error } = await supabase
        .from("tb_siswa")
        .insert([data])
        .select();

      if (error) {
        console.log("❌ Error:", error.message);
        console.log("Error code:", error.code);
        if (error.code === "22001") {
          console.log("📏 FOUND THE LIMIT! Kelas field has varchar constraint");
        }
      } else {
        console.log("✅ Success");

        // Delete the test data
        await supabase.from("tb_siswa").delete().eq("nisn", data.nisn);
        console.log("🗑️ Cleaned up");
      }
    } catch (error) {
      console.log("❌ Exception:", error.message);
    }
  }
}

testKelasLength();
