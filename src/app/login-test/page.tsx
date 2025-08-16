"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginTestPage() {
  const [loginStatus, setLoginStatus] = useState("Checking...");
  const [userData, setUserData] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>({});

  useEffect(() => {
    const testLogin = async () => {
      try {
        // Simulate login check
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
          setLoginStatus("No user found in localStorage");

          // Try to set test user
          const testUser = {
            username: "aini",
            role: "guru",
            nama: "Aini Abdul",
          };

          localStorage.setItem("user", JSON.stringify(testUser));
          setLoginStatus("Test user set in localStorage");
          setUserData(testUser);

          // Test fetch data after setting user
          await testFetchData(testUser.username);
        } else {
          const parsedUser = JSON.parse(storedUser);
          setLoginStatus("User found in localStorage");
          setUserData(parsedUser);

          // Test fetch data with existing user
          await testFetchData(parsedUser.username);
        }
      } catch (error) {
        setLoginStatus("Error: " + (error as Error).message);
      }
    };

    const testFetchData = async (username: string) => {
      const supabase = createClient();
      const results: any = {};

      try {
        // Test siswa query
        console.log("Testing siswa query for username:", username);
        const { data: siswaData, error: siswaError } = await supabase
          .from("tb_siswa")
          .select("nisn, nama_siswa, kelas, nama_dudi")
          .eq("id_guru", username);

        results.siswa = { data: siswaData, error: siswaError };
        console.log("Siswa result:", results.siswa);

        if (siswaData && siswaData.length > 0) {
          const nisnList = siswaData.map((s) => s.nisn);

          // Test jurnal query
          console.log("Testing jurnal query for NISN list:", nisnList);
          const { data: jurnalData, error: jurnalError } = await supabase
            .from("tb_jurnal")
            .select("*")
            .in("nisn", nisnList)
            .order("tanggal", { ascending: false })
            .limit(5);

          results.jurnal = { data: jurnalData, error: jurnalError };
          console.log("Jurnal result:", results.jurnal);

          // Test attendance query
          const today = new Date().toISOString().split("T")[0];
          console.log("Testing attendance query for date:", today);
          const { data: attendanceData, error: attendanceError } =
            await supabase
              .from("tb_absensi")
              .select("*")
              .in("nisn", nisnList)
              .eq("tanggal", today);

          results.attendance = { data: attendanceData, error: attendanceError };
          console.log("Attendance result:", results.attendance);
        }

        setTestResults(results);
      } catch (error) {
        console.error("Test fetch data error:", error);
        results.error = error;
        setTestResults(results);
      }
    };

    testLogin();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Login & Data Test</h1>

      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Login Status</h2>
        <p className="text-lg">{loginStatus}</p>
      </div>

      {userData && (
        <div className="mb-6 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">User Data</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
            {JSON.stringify(userData, null, 2)}
          </pre>
        </div>
      )}

      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Data Fetch Test Results</h2>
        {Object.entries(testResults).map(
          ([testName, result]: [string, any]) => (
            <div key={testName} className="mb-4">
              <h3 className="text-lg font-medium capitalize">{testName}</h3>
              {result?.error ? (
                <div className="bg-red-100 p-3 rounded text-red-800">
                  <strong>Error:</strong>
                  <pre className="mt-2 text-sm overflow-x-auto">
                    {JSON.stringify(result.error, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="bg-green-100 p-3 rounded text-green-800">
                  <strong>Success!</strong> Found {result?.data?.length || 0}{" "}
                  records
                  {result?.data && result.data.length > 0 && (
                    <pre className="mt-2 text-sm overflow-x-auto max-h-40 overflow-y-auto">
                      {JSON.stringify(result.data[0], null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
