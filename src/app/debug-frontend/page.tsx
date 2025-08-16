"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DebugPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runTests = async () => {
      const supabase = createClient();
      const testResults: any = {};

      try {
        // Test 1: tb_siswa
        console.log("Testing tb_siswa...");
        const { data: siswaData, error: siswaError } = await supabase
          .from("tb_siswa")
          .select("*")
          .limit(3);

        testResults.siswa = { data: siswaData, error: siswaError };

        // Test 2: tb_guru
        console.log("Testing tb_guru...");
        const { data: guruData, error: guruError } = await supabase
          .from("tb_guru")
          .select("*")
          .limit(3);

        testResults.guru = { data: guruData, error: guruError };

        // Test 3: tb_jurnal
        console.log("Testing tb_jurnal...");
        const { data: jurnalData, error: jurnalError } = await supabase
          .from("tb_jurnal")
          .select("*")
          .limit(3);

        testResults.jurnal = { data: jurnalData, error: jurnalError };

        // Test 4: tb_absensi
        console.log("Testing tb_absensi...");
        const { data: absensiData, error: absensiError } = await supabase
          .from("tb_absensi")
          .select("*")
          .limit(3);

        testResults.absensi = { data: absensiData, error: absensiError };

        // Test 5: Guru dashboard specific query
        console.log("Testing guru dashboard query...");
        const { data: testGuruData, error: testGuruError } = await supabase
          .from("tb_siswa")
          .select("nisn, nama_siswa, kelas, nama_dudi")
          .eq("id_guru", "aini");

        testResults.guruSpecific = { data: testGuruData, error: testGuruError };
      } catch (error) {
        console.error("Frontend test error:", error);
        testResults.generalError = error;
      }

      setResults(testResults);
      setLoading(false);
    };

    runTests();
  }, []);

  if (loading) {
    return <div className="p-8">Running database tests...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Database Debug Results</h1>

      {Object.entries(results).map(([testName, result]: [string, any]) => (
        <div key={testName} className="mb-6 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2 capitalize">{testName}</h2>

          {result.error ? (
            <div className="bg-red-100 p-3 rounded text-red-800">
              <strong>Error:</strong>
              <pre className="mt-2 text-sm overflow-x-auto">
                {JSON.stringify(result.error, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="bg-green-100 p-3 rounded text-green-800">
              <strong>Success!</strong>
              <pre className="mt-2 text-sm overflow-x-auto max-h-40 overflow-y-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
