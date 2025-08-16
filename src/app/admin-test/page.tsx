"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminTestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testUsersQuery = async () => {
    setLoading(true);
    try {
      console.log("Testing users query...");
      const supabase = createClient();
      console.log("Supabase client created:", supabase);

      const { data, error, count } = await supabase
        .from("tb_user")
        .select("*", { count: "exact" });

      console.log("Query result:", { data, error, count });

      if (error) {
        setResult({ error: error.message, details: error });
        return;
      }

      setResult({
        success: true,
        users: data,
        count: data?.length || 0,
        sampleUser: data?.[0] || null,
      });
    } catch (error: any) {
      console.error("Catch error:", error);
      setResult({ error: error.message || String(error), catchError: true });
    } finally {
      setLoading(false);
    }
  };

  const checkLocalStorage = () => {
    const userData = localStorage.getItem("userData");
    console.log("LocalStorage userData:", userData);
    setResult({ localStorage: userData ? JSON.parse(userData) : null });
  };

  const clearLocalStorage = () => {
    localStorage.removeItem("user");
    setResult({ message: "localStorage cleared" });
  };

  const directLoginAsAdmin = () => {
    const adminData = {
      id: 1,
      username: "admin",
      nama: "Administrator",
      role: "admin",
    };

    localStorage.setItem("userData", JSON.stringify(adminData));
    console.log("Direct admin login - data saved:", adminData);

    // Redirect to admin dashboard
    window.location.href = "/admin/dashboard";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Admin Login Test</h1>

        <div className="space-y-4">
          <button
            onClick={testUsersQuery}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Testing..." : "          Test Users Query"}
          </button>

          <button
            onClick={directLoginAsAdmin}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Direct Login as Admin (Skip DB)
          </button>

          <button
            onClick={checkLocalStorage}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Check LocalStorage
          </button>

          <button
            onClick={clearLocalStorage}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Clear LocalStorage
          </button>
        </div>

        {result && (
          <div className="mt-6 p-4 bg-white border rounded">
            <h3 className="font-bold mb-2">Result:</h3>
            <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-bold mb-2">Test Credentials:</h3>
          <p>Username: admin</p>
          <p>Password: admin123</p>
          <p>Role: admin</p>
        </div>
      </div>
    </div>
  );
}
