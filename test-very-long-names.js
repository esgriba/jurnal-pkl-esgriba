require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

async function testVeryLongNames() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const testCases = [
    {
      name: "Test 30 chars nama_siswa",
      data: {
        nisn: "1234567893",
        nama_siswa: "VERY LONG STUDENT NAME TEST 30", // 30 chars
        kelas: "XII Akuntansi",
        tahun_pelajaran: "2025-2026",
        semester: "Ganjil",
        id_dudi: 1,
        nama_dudi: "Bank Mandiri KCP Wongsorejo",
        id_guru: "siska",
        nama_guru: "Siska Purwanti, S.E.",
      },
    },
    {
      name: "Test 50 chars nama_siswa",
      data: {
        nisn: "1234567894",
        nama_siswa: "VERY VERY LONG STUDENT NAME TEST WITH 50 CHARS", // 47 chars
        kelas: "XII Akuntansi",
        tahun_pelajaran: "2025-2026",
        semester: "Ganjil",
        id_dudi: 1,
        nama_dudi: "Bank Mandiri KCP Wongsorejo",
        id_guru: "siska",
        nama_guru: "Siska Purwanti, S.E.",
      },
    },
    {
      name: "Test original problem case",
      data: {
        nisn: "0074612857",
        nama_siswa: "DINA RIZA AYU MATUSSHOLEHA", // 26 chars
        kelas: "XII Akuntansi",
        tahun_pelajaran: "2025-2026",
        semester: "Ganjil",
        id_dudi: 1,
        nama_dudi: "Bank Mandiri KCP Wongsorejo",
        id_guru: "siska",
        nama_guru: "Siska Purwanti, S.E.",
      },
    },
  ];

  for (const testCase of testCases) {
    console.log(`\n${testCase.name}:`);
    console.log(
      `- nama_siswa: ${testCase.data.nama_siswa.length} chars: "${testCase.data.nama_siswa}"`
    );

    try {
      const { data, error } = await supabase
        .from("tb_siswa")
        .insert([testCase.data])
        .select();

      if (error) {
        console.log("❌ Error:", error.message);
        console.log("Error code:", error.code);
        console.log("Error details:", error.details);
      } else {
        console.log("✅ Success");

        // Delete the test data
        await supabase.from("tb_siswa").delete().eq("nisn", testCase.data.nisn);
        console.log("🗑️ Cleaned up test data");
      }
    } catch (error) {
      console.log("❌ Exception:", error.message);
    }
  }
}

testVeryLongNames();
