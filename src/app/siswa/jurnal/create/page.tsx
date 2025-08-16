"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { jurnalSchema, type JurnalFormData } from "@/lib/validations";
import {
  ArrowLeft,
  Save,
  Calendar,
  MapPin,
  FileText,
  User,
  Users,
  CheckCircle,
  Clock,
  Building,
  Edit3,
} from "lucide-react";
import Link from "next/link";

interface UserData {
  id: number;
  username: string;
  nama: string;
  role: string;
}

interface SiswaData {
  nisn: string;
  nama_siswa: string;
  kelas: string;
  tahun_pelajaran: string;
  semester: string;
  nama_dudi: string;
  nama_guru: string;
  id_dudi: string;
  id_guru: string;
}

export default function CreateJurnalPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [siswaData, setSiswaData] = useState<SiswaData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPersonal, setSelectedPersonal] = useState<string[]>([]);
  const [selectedSosial, setSelectedSosial] = useState<string[]>([]);
  const router = useRouter();
  const supabase = createClient();

  // Options for evaluasi diri
  const personalOptions = [
    "Disiplin",
    "Jujur",
    "Tanggung Jawab",
    "Teliti/Cermat",
    "Kreatif/Inovatif",
  ];

  const sosialOptions = [
    "Berkomunikasi dengan Pimpinan",
    "Berkomunikasi/bekerjasama dengan karyawan",
    "Berdiskusi dengan rekan sekelompok",
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    watch,
  } = useForm<JurnalFormData>({
    resolver: zodResolver(jurnalSchema),
    defaultValues: {
      tanggal: new Date().toISOString().split("T")[0],
      evadir_personal: [],
      evadir_sosial: [],
    },
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "siswa") {
      router.push("/login");
      return;
    }

    setUser(parsedUser);
    fetchSiswaData(parsedUser.username);
  }, [router]);

  const fetchSiswaData = async (username: string) => {
    try {
      // First get user data to get the nama
      const { data: userData, error: userError } = await supabase
        .from("tb_user")
        .select("nama")
        .eq("username", username)
        .single();

      if (userError) {
        console.error("Error fetching user data:", userError);
        return;
      }

      // Then find siswa data by matching nama_siswa with user nama
      const { data: siswa, error } = await supabase
        .from("tb_siswa")
        .select("*")
        .eq("nama_siswa", userData.nama)
        .single();

      if (error) {
        console.error("Error fetching siswa data:", error);
        return;
      }

      setSiswaData(siswa);

      // Auto-fill lokasi dengan nama dudi
      setValue("lokasi", siswa.nama_dudi);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const onSubmit = async (data: JurnalFormData) => {
    if (!siswaData) return;

    // Custom validation for checkboxes
    if (selectedPersonal.length === 0) {
      return;
    }
    if (selectedSosial.length === 0) {
      return;
    }

    setIsLoading(true);

    try {
      console.log("Form data received:", data);

      // Generate shorter ID that fits VARCHAR(15)
      const timestamp = Date.now().toString();
      const shortId = timestamp.slice(-8); // Take last 8 digits
      const idJurnal = `JRN${shortId}`;

      console.log("Generated ID:", idJurnal, "Length:", idJurnal.length);

      const jurnalData = {
        id_jurnal: idJurnal,
        nisn: siswaData.nisn,
        nama_siswa: siswaData.nama_siswa,
        tahun_pelajaran: siswaData.tahun_pelajaran,
        semester: siswaData.semester,
        tanggal: data.tanggal,
        evadir_personal: selectedPersonal.join(", "),
        evadir_sosial: selectedSosial.join(", "),
        foto_kegiatan: "", // Foto upload feature removed
        deskripsi_kegiatan: data.deskripsi_kegiatan,
        lokasi: data.lokasi || siswaData.nama_dudi,
        id_guru: siswaData.id_guru,
        nama_guru: siswaData.nama_guru,
        id_dudi: siswaData.id_dudi,
        nama_dudi: siswaData.nama_dudi,
      };

      console.log("Inserting jurnal data:", jurnalData);

      const { data: insertResult, error } = await supabase
        .from("tb_jurnal")
        .insert([jurnalData])
        .select();

      if (error) {
        console.error("Database insert error:", error);
        throw new Error(
          `Database error: ${error.message || JSON.stringify(error)}`
        );
      }

      console.log("Insert success:", insertResult);
      alert("Jurnal Tersimpan! Jurnal PKL berhasil disimpan ke database");

      // Redirect to jurnal list
      router.push("/siswa/jurnal");
      router.push("/siswa/jurnal");
    } catch (error) {
      console.error("Error creating jurnal:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan tidak dikenal";
      setError("tanggal", { message: errorMessage });
      alert(`Gagal Menyimpan Jurnal: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePersonalChange = (option: string, checked: boolean) => {
    if (checked) {
      setSelectedPersonal((prev) => [...prev, option]);
    } else {
      setSelectedPersonal((prev) => prev.filter((item) => item !== option));
    }
  };

  const handleSosialChange = (option: string, checked: boolean) => {
    if (checked) {
      setSelectedSosial((prev) => [...prev, option]);
    } else {
      setSelectedSosial((prev) => prev.filter((item) => item !== option));
    }
  };

  if (!user || !siswaData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header with Gradient */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/siswa/dashboard"
                className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors duration-200 group"
              >
                <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                Kembali
              </Link>
              <div className="ml-6 hidden sm:block">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-2 rounded-lg mr-3">
                    <Edit3 className="h-5 w-5" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      Buat Jurnal Baru
                    </h1>
                    <p className="text-sm text-gray-500">
                      Catat kegiatan PKL hari ini
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                Step 1 of 1
              </div>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Card */}
        <div className="mb-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl text-white overflow-hidden">
          <div className="px-6 py-8 sm:px-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                  <FileText className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-indigo-100 mt-1">
                  Mari dokumentasikan kegiatan PKL Anda hari ini dengan lengkap
                  dan detail.
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
              <div className="flex items-center">
                <Calendar className="h-6 w-6 text-white mr-3" />
                <h3 className="text-lg font-semibold text-white">
                  Informasi Dasar
                </h3>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Tanggal */}
              <div className="group">
                <label
                  htmlFor="tanggal"
                  className="flex items-center text-sm font-medium text-gray-700 mb-3"
                >
                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                  Tanggal <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    {...register("tanggal")}
                    type="date"
                    id="tanggal"
                    className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                  />
                </div>
                {errors.tanggal && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                    {errors.tanggal.message}
                  </p>
                )}
              </div>

              {/* Tempat PKL */}
              <div className="group">
                <label
                  htmlFor="lokasi"
                  className="flex items-center text-sm font-medium text-gray-700 mb-3"
                >
                  <MapPin className="h-4 w-4 mr-2 text-green-500" />
                  Tempat PKL
                </label>
                <div className="relative">
                  <input
                    {...register("lokasi")}
                    type="text"
                    id="lokasi"
                    disabled
                    className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 cursor-not-allowed"
                    placeholder="Otomatis terisi sesuai data DUDI"
                  />
                  <Building className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                </div>
                {errors.lokasi && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                    {errors.lokasi.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Deskripsi Kegiatan Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-green-500 to-teal-600 px-6 py-4">
              <div className="flex items-center">
                <FileText className="h-6 w-6 text-white mr-3" />
                <h3 className="text-lg font-semibold text-white">
                  Deskripsi Kegiatan
                </h3>
              </div>
            </div>
            <div className="p-6">
              <div className="group">
                <label
                  htmlFor="deskripsi_kegiatan"
                  className="flex items-center text-sm font-medium text-gray-700 mb-3"
                >
                  <Edit3 className="h-4 w-4 mr-2 text-green-500" />
                  Deskripsi Kegiatan{" "}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <textarea
                    {...register("deskripsi_kegiatan")}
                    id="deskripsi_kegiatan"
                    rows={5}
                    className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-green-300 resize-none"
                    placeholder="Jelaskan kegiatan yang dilakukan hari ini dengan detail...&#10;&#10;"
                  />
                </div>
                {errors.deskripsi_kegiatan && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                    {errors.deskripsi_kegiatan.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Evaluasi Diri Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Evaluasi Personal */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4">
                <div className="flex items-center">
                  <User className="h-6 w-6 text-white mr-3" />
                  <h3 className="text-lg font-semibold text-white">
                    Evaluasi Personal
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-4">
                  <CheckCircle className="h-4 w-4 mr-2 text-purple-500" />
                  Pilih aspek personal yang sudah dikembangkan{" "}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="space-y-3">
                  {personalOptions.map((option, index) => (
                    <div key={option} className="group">
                      <label className="flex items-center p-3 rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-all duration-200">
                        <input
                          type="checkbox"
                          id={`personal-${option}`}
                          className="h-5 w-5 text-purple-600 border-2 border-gray-300 rounded-lg focus:ring-purple-500 focus:ring-2"
                          checked={selectedPersonal.includes(option)}
                          onChange={(e) =>
                            handlePersonalChange(option, e.target.checked)
                          }
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-purple-700">
                          {option}
                        </span>
                        {selectedPersonal.includes(option) && (
                          <CheckCircle className="h-4 w-4 text-purple-500 ml-auto" />
                        )}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedPersonal.length === 0 && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 flex items-center">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      Pilih minimal satu evaluasi personal
                    </p>
                  </div>
                )}
                <div className="mt-4 text-xs text-gray-500">
                  {selectedPersonal.length} dari {personalOptions.length}{" "}
                  dipilih
                </div>
              </div>
            </div>

            {/* Evaluasi Sosial */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-4">
                <div className="flex items-center">
                  <Users className="h-6 w-6 text-white mr-3" />
                  <h3 className="text-lg font-semibold text-white">
                    Evaluasi Sosial
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-4">
                  <CheckCircle className="h-4 w-4 mr-2 text-orange-500" />
                  Pilih aspek sosial yang sudah dikembangkan{" "}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="space-y-3">
                  {sosialOptions.map((option, index) => (
                    <div key={option} className="group">
                      <label className="flex items-center p-3 rounded-xl border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 cursor-pointer transition-all duration-200">
                        <input
                          type="checkbox"
                          id={`sosial-${option}`}
                          className="h-5 w-5 text-orange-600 border-2 border-gray-300 rounded-lg focus:ring-orange-500 focus:ring-2"
                          checked={selectedSosial.includes(option)}
                          onChange={(e) =>
                            handleSosialChange(option, e.target.checked)
                          }
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-orange-700">
                          {option}
                        </span>
                        {selectedSosial.includes(option) && (
                          <CheckCircle className="h-4 w-4 text-orange-500 ml-auto" />
                        )}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedSosial.length === 0 && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 flex items-center">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      Pilih minimal satu evaluasi sosial
                    </p>
                  </div>
                )}
                <div className="mt-4 text-xs text-gray-500">
                  {selectedSosial.length} dari {sosialOptions.length} dipilih
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                <Link
                  href="/siswa/dashboard"
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Batal
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Jurnal"
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
