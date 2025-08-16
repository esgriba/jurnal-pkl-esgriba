require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

async function testRealData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Test dengan data real yang menyebabkan error
  const realData = {
    nisn: "0074612857",
    nama_siswa: "DINA RIZA AYU MATUSSHOLEHA",
    kelas: "XII Akuntansi",
    tahun_pelajaran: "2025-2026",
    semester: "Ganjil",
    id_dudi: 1,
    nama_dudi: "Bank Mandiri KCP Wongsorejo",
    id_guru: "siska",
    nama_guru: "Siska Purwanti, S.E.",
  };

  console.log("Testing real data from Excel:");
  console.log("Field lengths:");
  Object.keys(realData).forEach((key) => {
    const value = realData[key];
    console.log(
      `- ${key}: ${
        typeof value === "string" ? value.length : "N/A"
      } chars: "${value}"`
    );
  });

  try {
    const { data: result, error } = await supabase
      .from("tb_siswa")
      .insert([realData])
      .select();

    if (error) {
      console.log("\n❌ Error:", error.message);
      console.log("Error code:", error.code);
      console.log("Error details:", error.details);
      console.log("Error hint:", error.hint);
    } else {
      console.log("\n✅ Success with real data");

      // Delete the test data
      await supabase.from("tb_siswa").delete().eq("nisn", realData.nisn);
      console.log("🗑️ Cleaned up");
    }
  } catch (error) {
    console.log("\n❌ Exception:", error.message);
  }

  // Test dengan data yang berbeda type - check if id_dudi should be string
  console.log("\n\nTesting with id_dudi as string:");
  const realDataString = { ...realData, id_dudi: "1" };

  try {
    const { data: result, error } = await supabase
      .from("tb_siswa")
      .insert([realDataString])
      .select();

    if (error) {
      console.log("❌ Error:", error.message);
    } else {
      console.log("✅ Success with id_dudi as string");

      // Delete the test data
      await supabase.from("tb_siswa").delete().eq("nisn", realDataString.nisn);
      console.log("🗑️ Cleaned up");
    }
  } catch (error) {
    console.log("❌ Exception:", error.message);
  }
}

testRealData();
