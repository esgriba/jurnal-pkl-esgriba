"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DashboardLayout from "@/components/ui/DashboardLayout";
import {
  ArrowLeft,
  BookOpen,
  User,
  Calendar,
  MapPin,
  Building2,
  UserCheck,
  FileText,
  Star,
} from "lucide-react";
import Link from "next/link";

interface JurnalDetail {
  id_jurnal: string;
  nisn: string;
  nama_siswa: string;
  tahun_pelajaran: string;
  semester: string;
  tanggal: string;
  evadir_personal: string;
  evadir_sosial: string;
  foto_kegiatan: string;
  deskripsi_kegiatan: string;
  lokasi: string;
  id_guru: string;
  nama_guru: string;
  id_dudi: string;
  nama_dudi: string;
  created_at: string;
}

export default function JurnalDetailPage() {
  const [jurnal, setJurnal] = useState<JurnalDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();

  useEffect(() => {
    checkUser();
    if (params.id) {
      fetchJurnalDetail(params.id as string);
    }
  }, [params.id]);

  const checkUser = () => {
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

    setCurrentUser(parsedUser);
  };

  const fetchJurnalDetail = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("tb_jurnal")
        .select("*")
        .eq("id_jurnal", id)
        .single();

      if (error) throw error;

      setJurnal(data);
    } catch (error) {
      console.error("Error fetching jurnal detail:", error);
      alert("Error mengambil detail jurnal");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="admin">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading detail jurnal...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!jurnal) {
    return (
      <DashboardLayout userRole="admin">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Jurnal tidak ditemukan
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              ID jurnal yang Anda cari tidak ditemukan
            </p>
            <div className="mt-6">
              <Link
                href="/admin/jurnal"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Kembali ke Daftar Jurnal
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="min-h-screen bg-gray-50">
        {/* Main Content */}
        <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              href="/admin/jurnal"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Daftar Jurnal
            </Link>
            <div className="flex items-center mb-4">
              <BookOpen className="h-6 w-6 text-indigo-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">
                Detail Jurnal PKL
              </h1>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* Header Info */}
            <div className="px-4 py-5 sm:px-6 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {jurnal.id_jurnal}
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Dibuat pada{" "}
                    {new Date(jurnal.created_at).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {jurnal.tahun_pelajaran}
                  </div>
                  <div className="text-sm text-gray-500">
                    Semester {jurnal.semester}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 py-5 sm:p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                {/* Siswa Info */}
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Informasi Siswa
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="font-medium">{jurnal.nama_siswa}</div>
                      <div className="text-gray-600">NISN: {jurnal.nisn}</div>
                    </div>
                  </dd>
                </div>

                {/* Tanggal Kegiatan */}
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Tanggal Kegiatan
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 font-medium">
                    {new Date(jurnal.tanggal).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </dd>
                </div>

                {/* Lokasi */}
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Lokasi Kegiatan
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {jurnal.lokasi || "Tidak disebutkan"}
                  </dd>
                </div>

                {/* Guru Pembimbing */}
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Guru Pembimbing
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <div className="font-medium">{jurnal.nama_guru}</div>
                    <div className="text-gray-600">ID: {jurnal.id_guru}</div>
                  </dd>
                </div>

                {/* DUDI */}
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Building2 className="h-4 w-4 mr-2" />
                    Dunia Usaha/Dunia Industri
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <div className="font-medium">{jurnal.nama_dudi}</div>
                    <div className="text-gray-600">ID: {jurnal.id_dudi}</div>
                  </dd>
                </div>

                {/* Deskripsi Kegiatan */}
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Deskripsi Kegiatan
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="whitespace-pre-wrap">
                        {jurnal.deskripsi_kegiatan}
                      </p>
                    </div>
                  </dd>
                </div>

                {/* Evaluasi Diri */}
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Star className="h-4 w-4 mr-2" />
                    Evaluasi Diri
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-md">
                        <h4 className="font-medium text-blue-900 mb-2">
                          Aspek Personal
                        </h4>
                        <p className="text-blue-700 whitespace-pre-wrap">
                          {jurnal.evadir_personal}
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-md">
                        <h4 className="font-medium text-green-900 mb-2">
                          Aspek Sosial
                        </h4>
                        <p className="text-green-700 whitespace-pre-wrap">
                          {jurnal.evadir_sosial}
                        </p>
                      </div>
                    </div>
                  </dd>
                </div>

                {/* Foto Kegiatan */}
                {jurnal.foto_kegiatan && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">
                      Foto Kegiatan
                    </dt>
                    <dd className="mt-1">
                      <img
                        src={jurnal.foto_kegiatan}
                        alt="Foto kegiatan"
                        className="max-w-md rounded-lg shadow-md"
                      />
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Footer Actions */}
            <div className="px-4 py-4 sm:px-6 bg-gray-50">
              <div className="flex justify-between">
                <Link
                  href="/admin/jurnal"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali ke Daftar
                </Link>

                <div className="text-sm text-gray-500">
                  ID: {jurnal.id_jurnal}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}
