require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

async function testFieldLengths() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const testCases = [
    {
      name: "Test 1 - Short names",
      data: {
        nisn: "1234567890",
        nama_siswa: "Test Student", // 12 chars
        kelas: "XII RPL", // 7 chars
        tahun_pelajaran: "2025-2026",
        semester: "Ganjil",
        id_dudi: 1,
        nama_dudi: "Test Company", // 12 chars
        id_guru: "test", // 4 chars
        nama_guru: "Test Teacher", // 12 chars
      },
    },
    {
      name: "Test 2 - Medium names",
      data: {
        nisn: "1234567891",
        nama_siswa: "Medium Student Name", // 19 chars
        kelas: "XII Akuntansi", // 13 chars
        tahun_pelajaran: "2025-2026",
        semester: "Ganjil",
        id_dudi: 2,
        nama_dudi: "Medium Company Name", // 19 chars
        id_guru: "medium", // 6 chars
        nama_guru: "Medium Teacher Name", // 19 chars
      },
    },
    {
      name: "Test 3 - Long names (25+ chars)",
      data: {
        nisn: "1234567892",
        nama_siswa: "FITRIANA EKA AMELIA TEST", // 24 chars
        kelas: "XII Akuntansi",
        tahun_pelajaran: "2025-2026",
        semester: "Ganjil",
        id_dudi: 3,
        nama_dudi: "Bank Mandiri KCP Wongsorejo", // 27 chars
        id_guru: "siska",
        nama_guru: "Siska Purwanti, S.E.", // 20 chars
      },
    },
  ];

  for (const testCase of testCases) {
    console.log(`\n${testCase.name}:`);
    console.log("Data lengths:");
    console.log(
      `- nama_siswa: ${testCase.data.nama_siswa.length} chars: "${testCase.data.nama_siswa}"`
    );
    console.log(
      `- nama_dudi: ${testCase.data.nama_dudi.length} chars: "${testCase.data.nama_dudi}"`
    );
    console.log(
      `- nama_guru: ${testCase.data.nama_guru.length} chars: "${testCase.data.nama_guru}"`
    );
    console.log(
      `- kelas: ${testCase.data.kelas.length} chars: "${testCase.data.kelas}"`
    );
    console.log(
      `- id_guru: ${testCase.data.id_guru.length} chars: "${testCase.data.id_guru}"`
    );

    try {
      const { data, error } = await supabase
        .from("tb_siswa")
        .insert([testCase.data])
        .select();

      if (error) {
        console.log("❌ Error:", error.message);
      } else {
        console.log("✅ Success:", data);

        // Delete the test data
        await supabase.from("tb_siswa").delete().eq("nisn", testCase.data.nisn);
      }
    } catch (error) {
      console.log("❌ Exception:", error.message);
    }
  }
}

testFieldLengths();
