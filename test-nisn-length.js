require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

async function testNisnLength() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const testCases = [
    {
      name: "NISN 10 chars",
      nisn: "1234567890", // 10 chars
    },
    {
      name: "NISN 15 chars",
      nisn: "123456789012345", // 15 chars
    },
    {
      name: "NISN 20 chars",
      nisn: "12345678901234567890", // 20 chars
    },
    {
      name: "NISN 25 chars",
      nisn: "1234567890123456789012345", // 25 chars
    },
    {
      name: "NISN 30 chars",
      nisn: "123456789012345678901234567890", // 30 chars
    },
  ];

  for (const testCase of testCases) {
    console.log(
      `\n${testCase.name}: "${testCase.nisn}" (${testCase.nisn.length} chars)`
    );

    const data = {
      nisn: testCase.nisn,
      nama_siswa: "Test Student",
      kelas: "XII Test",
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
          console.log("📏 Field too long for varchar constraint");
        }
      } else {
        console.log("✅ Success");

        // Delete the test data
        await supabase.from("tb_siswa").delete().eq("nisn", testCase.nisn);
        console.log("🗑️ Cleaned up");
      }
    } catch (error) {
      console.log("❌ Exception:", error.message);
    }
  }
}

testNisnLength();
