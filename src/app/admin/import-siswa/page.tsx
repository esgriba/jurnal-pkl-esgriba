"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../../components/ui/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface ImportResult {
  success: boolean;
  message: string;
  summary: {
    totalRows: number;
    successfulInserts: number;
    errors: number;
    errorDetails: Array<{
      row: number;
      error: string;
      data: any;
    }>;
  };
}

export default function ImportSiswaPage() {
  const [user, setUser] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "warning" | "info";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Simple notification replacement
  const showNotification = (
    type: "success" | "error" | "warning" | "info",
    text: string
  ) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "admin") {
      router.push("/login");
      return;
    }

    setUser(parsedUser);
  }, [router]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Check file type
      const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();
      if (!["xlsx", "xls"].includes(fileExtension || "")) {
        showNotification(
          "error",
          "Format File Tidak Valid - Harap pilih file Excel (.xlsx atau .xls)"
        );
        return;
      }

      setFile(selectedFile);
      setResult(null);
      showNotification(
        "success",
        `File ${selectedFile.name} siap untuk diupload`
      );
    }
  };

  const handleUpload = async () => {
    if (!file) {
      showNotification(
        "warning",
        "Harap pilih file Excel sebelum melakukan upload"
      );
      return;
    }

    setIsUploading(true);
    setResult(null);

    showNotification("info", "Sedang mengupload dan memvalidasi data Excel...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/import-siswa", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      // Ensure data has proper structure
      if (!data.summary) {
        data.summary = {
          totalRows: 0,
          successfulInserts: 0,
          errors: 1,
          errorDetails: [
            {
              row: 0,
              error: data.error || data.message || "Unknown error",
              data: {},
            },
          ],
        };
      }

      setResult(data);

      if (data.success) {
        showNotification(
          "success",
          `Import Berhasil! ${
            data.summary?.successfulInserts || 0
          } siswa berhasil diimport`
        );

        // Clear file input after successful upload
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        showNotification(
          "error",
          `Import Gagal: ${
            data.message || "Terjadi kesalahan saat mengimport data"
          }`
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      showNotification(
        "error",
        "Terjadi kesalahan jaringan saat mengupload file"
      );

      setResult({
        success: false,
        message: "Error uploading file",
        summary: {
          totalRows: 0,
          successfulInserts: 0,
          errors: 1,
          errorDetails: [],
        },
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    // Create template data
    const templateData = [
      {
        NISN: "1234567890",
        "Nama Siswa": "Contoh Siswa",
        Kelas: "XII RPL 1",
        "Tahun Pelajaran": "2024/2025",
        Semester: "Ganjil",
        "ID DUDI": "DUDI001",
        "Nama DUDI": "PT. Contoh Perusahaan",
        "ID Guru": "GURU001",
        "Nama Guru": "Budi Santoso",
      },
    ];

    // Convert to CSV
    const headers = Object.keys(templateData[0]);
    const csvContent = [
      headers.join(","),
      templateData
        .map((row) =>
          headers
            .map((header) => `"${row[header as keyof typeof row]}"`)
            .join(",")
        )
        .join("\n"),
    ].join("\n");

    // Download
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_import_siswa.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showNotification("success", "Template Excel berhasil didownload");
  };

  const exportErrors = () => {
    if (!result?.summary?.errorDetails?.length) return;

    const errorData = result.summary.errorDetails.map((error) => ({
      Baris: error.row,
      Error: error.error,
      Data: JSON.stringify(error.data),
    }));

    const headers = Object.keys(errorData[0]);
    const csvContent = [
      headers.join(","),
      errorData
        .map((row) =>
          headers
            .map((header) => `"${row[header as keyof typeof row]}"`)
            .join(",")
        )
        .join("\n"),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "import_errors.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Notification Message */}
        {message && (
          <div
            className={`p-4 rounded-lg border ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : message.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : message.type === "warning"
                ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            <div className="flex items-center">
              {message.type === "success" && (
                <CheckCircle className="h-5 w-5 mr-2" />
              )}
              {message.type === "error" && (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              {message.type === "warning" && (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              {message.type === "info" && (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              {message.text}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Import Data Siswa</h1>
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Template
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Upload File Excel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700">
                  Klik untuk pilih file Excel
                </p>
                <p className="text-sm text-gray-500">
                  Format yang didukung: .xlsx, .xls
                </p>
              </label>
            </div>

            {file && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-blue-800">File dipilih:</p>
                <p className="text-blue-600">{file.name}</p>
                <p className="text-sm text-blue-500">
                  Ukuran: {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {isUploading ? "Mengupload..." : "Upload & Import"}
              </Button>

              {file && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null);
                    setResult(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                >
                  Batal
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                Hasil Import
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={`p-4 rounded-lg ${
                  result.success
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                <p className="font-medium">{result.message}</p>
              </div>

              {result.summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {result.summary.totalRows}
                    </p>
                    <p className="text-sm text-blue-600">Total Baris</p>
                  </div>

                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {result.summary.successfulInserts}
                    </p>
                    <p className="text-sm text-green-600">Berhasil</p>
                  </div>

                  <div className="bg-red-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {result.summary.errors}
                    </p>
                    <p className="text-sm text-red-600">Error</p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-gray-600">
                      {result.summary.totalRows - result.summary.errors}
                    </p>
                    <p className="text-sm text-gray-600">Valid</p>
                  </div>
                </div>
              )}

              {result.summary &&
                result.summary.errorDetails &&
                result.summary.errorDetails.length > 0 && (
                  <div id="error-details" className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-red-800">
                        Detail Error:
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exportErrors}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Export Error
                      </Button>
                    </div>

                    <div className="max-h-60 overflow-y-auto bg-red-50 p-3 rounded border">
                      {result.summary.errorDetails
                        .slice(0, 10)
                        .map((error, index) => (
                          <div
                            key={index}
                            className="mb-2 pb-2 border-b border-red-200 last:border-b-0"
                          >
                            <p className="text-sm font-medium text-red-700">
                              Baris {error.row}: {error.error}
                            </p>
                          </div>
                        ))}
                      {result.summary.errorDetails.length > 10 && (
                        <p className="text-sm text-red-600 mt-2">
                          Dan {result.summary.errorDetails.length - 10} error
                          lainnya...
                        </p>
                      )}
                    </div>
                  </div>
                )}

              {result.success &&
                result.summary &&
                result.summary.successfulInserts > 0 && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => router.push("/admin/siswa")}
                      className="flex items-center gap-2"
                    >
                      Lihat Data Siswa
                    </Button>
                  </div>
                )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Format File Excel</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              File Excel harus memiliki kolom-kolom berikut (urutan boleh
              berbeda):
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>
                  <strong>NISN</strong> - Nomor Induk Siswa Nasional
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>
                  <strong>Nama Siswa</strong> - Nama lengkap siswa
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>
                  <strong>Kelas</strong> - Kelas siswa (contoh: XII RPL 1)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>
                  <strong>Tahun Pelajaran</strong> - Opsional (default:
                  2024/2025)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>
                  <strong>Semester</strong> - Opsional (default: Ganjil)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>
                  <strong>ID DUDI</strong> - ID Dunia Usaha/Industri
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>
                  <strong>Nama DUDI</strong> - Nama Dunia Usaha/Industri
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>
                  <strong>ID Guru</strong> - ID Guru Pembimbing
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>
                  <strong>Nama Guru</strong> - Nama Guru Pembimbing
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Wajib diisi
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 ml-4"></span>
              Opsional
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
