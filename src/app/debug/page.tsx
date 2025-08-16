"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  RefreshCw,
  Database,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface ConnectionStatus {
  connected: boolean;
  error?: string;
}

interface TableInfo {
  name: string;
  exists: boolean;
  count: number;
  sampleData?: any[];
  error?: string;
}

export default function DebugPage() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
  });
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const checkConnection = async () => {
    setIsLoading(true);
    try {
      // Test basic connection
      const { data, error } = await supabase
        .from("tb_user")
        .select("count", { count: "exact", head: true });

      if (error) {
        setConnectionStatus({ connected: false, error: error.message });
      } else {
        setConnectionStatus({ connected: true });
      }
    } catch (err) {
      setConnectionStatus({ connected: false, error: (err as Error).message });
    }
  };

  const checkTables = async () => {
    const tableNames = [
      "tb_user",
      "tb_siswa",
      "tb_guru",
      "tb_dudi",
      "tb_jurnal",
      "tb_absensi",
      "tb_monitoring",
    ];
    const tableInfo: TableInfo[] = [];

    for (const tableName of tableNames) {
      try {
        // Check if table exists and get count
        const { data, error, count } = await supabase
          .from(tableName)
          .select("*", { count: "exact" })
          .limit(3);

        if (error) {
          tableInfo.push({
            name: tableName,
            exists: false,
            count: 0,
            error: error.message,
          });
        } else {
          tableInfo.push({
            name: tableName,
            exists: true,
            count: count || 0,
            sampleData: data || [],
          });
        }
      } catch (err) {
        tableInfo.push({
          name: tableName,
          exists: false,
          count: 0,
          error: (err as Error).message,
        });
      }
    }

    setTables(tableInfo);
  };

  const runCheck = async () => {
    await checkConnection();
    await checkTables();
    setIsLoading(false);
  };

  useEffect(() => {
    runCheck();
  }, []);

  const testLogin = async (username: string, password: string) => {
    try {
      const { data: userData, error } = await supabase
        .from("tb_user")
        .select("*")
        .eq("username", username)
        .single();

      console.log("Login test result:", { userData, error });

      if (error) {
        alert(`Error: ${error.message}`);
      } else if (!userData) {
        alert("User tidak ditemukan");
      } else if (userData.password !== password) {
        alert("Password salah");
      } else {
        alert(`Login berhasil! Role: ${userData.role}`);
      }
    } catch (err) {
      alert(`Error: ${(err as Error).message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Database Debug
              </h1>
              <p className="text-gray-600">
                Informasi koneksi dan data database
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={runCheck}
                disabled={isLoading}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
              <Link
                href="/login"
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Kembali ke Login
              </Link>
            </div>
          </div>

          {/* Connection Status */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Status Koneksi
            </h2>
            <div
              className={`p-4 rounded-lg border ${
                connectionStatus.connected
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center">
                {connectionStatus.connected ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 mr-2" />
                )}
                <span
                  className={
                    connectionStatus.connected
                      ? "text-green-800"
                      : "text-red-800"
                  }
                >
                  {connectionStatus.connected
                    ? "Terhubung ke Supabase"
                    : "Gagal terhubung ke Supabase"}
                </span>
              </div>
              {connectionStatus.error && (
                <p className="text-sm text-red-600 mt-2">
                  {connectionStatus.error}
                </p>
              )}
            </div>
          </div>

          {/* Tables Status */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Status Tabel
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tables.map((table) => (
                <div
                  key={table.name}
                  className={`p-4 rounded-lg border ${
                    table.exists
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{table.name}</h3>
                    {table.exists ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {table.exists
                      ? `${table.count} record(s)`
                      : "Tabel tidak ditemukan"}
                  </p>
                  {table.error && (
                    <p className="text-sm text-red-600 mt-1">{table.error}</p>
                  )}
                  {table.sampleData && table.sampleData.length > 0 && (
                    <details className="mt-2">
                      <summary className="text-sm text-indigo-600 cursor-pointer">
                        Lihat sample data
                      </summary>
                      <pre className="text-xs bg-white p-2 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(table.sampleData, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Test Login */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Test Login
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => testLogin("2024001", "2024001123")}
                className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
              >
                <h3 className="font-medium text-blue-900">Test Siswa</h3>
                <p className="text-sm text-blue-600">Username: 2024001</p>
                <p className="text-sm text-blue-600">Password: 2024001123</p>
              </button>

              <button
                onClick={() => testLogin("GURU001", "guru123")}
                className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100"
              >
                <h3 className="font-medium text-green-900">Test Guru</h3>
                <p className="text-sm text-green-600">Username: GURU001</p>
                <p className="text-sm text-green-600">Password: guru123</p>
              </button>

              <button
                onClick={() => testLogin("admin", "admin123")}
                className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100"
              >
                <h3 className="font-medium text-purple-900">Test Admin</h3>
                <p className="text-sm text-purple-600">Username: admin</p>
                <p className="text-sm text-purple-600">Password: admin123</p>
              </button>
            </div>
          </div>

          {/* Action Required */}
          {!connectionStatus.connected && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">
                    Action Required
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Database belum dikonfigurasi dengan benar. Silakan jalankan
                    setup database.
                  </p>
                  <div className="mt-3">
                    <Link
                      href="/setup"
                      className="inline-flex items-center px-3 py-2 border border-yellow-300 rounded-md text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
                    >
                      Setup Database
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
