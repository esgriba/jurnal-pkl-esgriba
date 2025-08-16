require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

async function testNamaGuruLength() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const testCases = [
    {
      name: "Nama guru 20 chars",
      nama_guru: "Siska Purwanti, S.E.", // 20 chars
    },
    {
      name: "Nama guru 25 chars",
      nama_guru: "Test Teacher Name 25C", // 25 chars
    },
    {
      name: "Nama guru 26 chars",
      nama_guru: "Test Teacher Name 26CH", // 26 chars
    },
    {
      name: "Nama guru 30 chars (Fera)",
      nama_guru: "Fera Mega Haristina, S.Tr.Kom.", // 30 chars
    },
    {
      name: "Nama guru 29 chars (Frances)",
      nama_guru: "Frances Laurence, S.B., S.Pd.", // 29 chars
    },
  ];

  for (const testCase of testCases) {
    console.log(
      `\n${testCase.name}: "${testCase.nama_guru}" (${testCase.nama_guru.length} chars)`
    );

    const data = {
      nisn: `test${Math.random().toString().substr(2, 6)}`, // Random NISN
      nama_siswa: "Test Student",
      kelas: "XII Test",
      tahun_pelajaran: "2025-2026",
      semester: "Ganjil",
      id_dudi: 1,
      nama_dudi: "Test Company",
      id_guru: "siska",
      nama_guru: testCase.nama_guru,
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
          console.log(
            "📏 Field too long for varchar constraint - FOUND THE LIMIT!"
          );
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

testNamaGuruLength();
