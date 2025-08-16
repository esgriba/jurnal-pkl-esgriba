"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  FileText,
  User,
  Building2,
  CheckCircle,
  Users,
} from "lucide-react";
import Link from "next/link";

interface UserData {
  id: number;
  username: string;
  nama: string;
  role: string;
}

interface JurnalData {
  id_jurnal: string;
  nisn: string;
  nama_siswa: string;
  tanggal: string;
  deskripsi_kegiatan: string;
  evadir_personal: string;
  evadir_sosial: string;
  lokasi: string;
  nama_dudi: string;
  nama_guru: string;
  tahun_pelajaran: string;
  semester: string;
}

export default function DetailJurnalGuruPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [jurnalData, setJurnalData] = useState<JurnalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const params = useParams();
  const idJurnal = params.id as string;
  const supabase = createClient();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = () => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "guru") {
      router.push("/login");
      return;
    }

    setUser(parsedUser);
    fetchJurnalData(parsedUser.username);
  };

  const fetchJurnalData = async (username: string) => {
    try {
      setIsLoading(true);

      // First get guru user data to get the nama
      const { data: userData, error: userError } = await supabase
        .from("tb_user")
        .select("nama")
        .eq("username", username)
        .single();

      if (userError) {
        console.error("Error fetching user data:", userError);
        return;
      }

      // Fetch jurnal data and verify it belongs to this guru's students
      const { data: jurnal, error: jurnalError } = await supabase
        .from("tb_jurnal")
        .select("*")
        .eq("id_jurnal", idJurnal)
        .eq("nama_guru", userData.nama)
        .single();

      if (jurnalError) {
        console.error("Error fetching jurnal:", jurnalError);
        router.push("/guru/siswa");
        return;
      }

      setJurnalData(jurnal);
    } catch (err) {
      console.error("Error fetching jurnal data:", err);
      router.push("/guru/siswa");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const parseEvaluasiList = (evaluasiString: string) => {
    return evaluasiString.split(", ").filter((item) => item.trim() !== "");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!jurnalData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">
            Jurnal tidak ditemukan
          </h3>
          <p className="mt-2 text-gray-600">
            Jurnal tidak ada atau bukan dari siswa bimbingan Anda
          </p>
          <Link
            href="/guru/siswa"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Kembali ke Daftar Siswa
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href={`/guru/siswa/${jurnalData.nisn}`}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Kembali
            </Link>
            <div className="ml-4">
              <h1 className="text-xl font-semibold text-gray-900">
                Detail Jurnal PKL
              </h1>
              <p className="text-sm text-gray-600">
                {jurnalData.nama_siswa} - {formatDate(jurnalData.tanggal)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Jurnal Header Info */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Informasi Jurnal
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Siswa</p>
                    <p className="text-sm text-gray-900">
                      {jurnalData.nama_siswa}
                    </p>
                    <p className="text-xs text-gray-500">
                      NISN: {jurnalData.nisn}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tanggal</p>
                    <p className="text-sm text-gray-900">
                      {formatDate(jurnalData.tanggal)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Tempat PKL
                    </p>
                    <p className="text-sm text-gray-900">
                      {jurnalData.nama_dudi}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Lokasi Kegiatan
                    </p>
                    <p className="text-sm text-gray-900">{jurnalData.lokasi}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deskripsi Kegiatan */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Deskripsi Kegiatan
            </h3>
          </div>
          <div className="p-6">
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">
                {jurnalData.deskripsi_kegiatan}
              </p>
            </div>
          </div>
        </div>

        {/* Evaluasi Diri */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Evaluasi Personal */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Evaluasi Diri (Personal)
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                {parseEvaluasiList(jurnalData.evadir_personal).map(
                  (item, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  )
                )}
              </div>
              {parseEvaluasiList(jurnalData.evadir_personal).length === 0 && (
                <p className="text-gray-500 text-sm">
                  Tidak ada evaluasi personal
                </p>
              )}
            </div>
          </div>

          {/* Evaluasi Sosial */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Evaluasi Diri (Sosial)
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                {parseEvaluasiList(jurnalData.evadir_sosial).map(
                  (item, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  )
                )}
              </div>
              {parseEvaluasiList(jurnalData.evadir_sosial).length === 0 && (
                <p className="text-gray-500 text-sm">
                  Tidak ada evaluasi sosial
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6 flex justify-center">
          <Link
            href={`/guru/siswa/${jurnalData.nisn}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Riwayat Jurnal
          </Link>
        </div>
      </main>
    </div>
  );
}
