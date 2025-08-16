"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/Toast";
import {
  ArrowLeft,
  Edit,
  User,
  Calendar,
  GraduationCap,
  Users,
} from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Guru {
  id_guru: string;
  nama_guru: string;
}

interface AssignedSiswa {
  nisn: string;
  nama_siswa: string;
  kelas: string;
}

interface GuruDetailPageProps {
  params: Promise<{
    id_guru: string;
  }>;
}

export default function GuruDetailPage({ params }: GuruDetailPageProps) {
  const resolvedParams = use(params);
  const [guru, setGuru] = useState<Guru | null>(null);
  const [assignedSiswa, setAssignedSiswa] = useState<AssignedSiswa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();
  const { error } = useToast();

  useEffect(() => {
    checkUser();
    fetchGuruDetail();
    fetchAssignedSiswa();
  }, [resolvedParams.id_guru]);

  const checkUser = () => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== "admin") {
      router.push("/login");
      return;
    }

    setCurrentUser(user);
  };

  const fetchGuruDetail = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("tb_guru")
        .select("*")
        .eq("id_guru", resolvedParams.id_guru)
        .single();

      if (fetchError) {
        if (fetchError.code === "PGRST116") {
          error("Data guru tidak ditemukan");
          router.push("/admin/guru");
          return;
        }
        throw fetchError;
      }

      setGuru(data);
    } catch (fetchError) {
      console.error("Error fetching guru detail:", fetchError);
      error("Gagal memuat detail guru");
      router.push("/admin/guru");
    }
  };

  const fetchAssignedSiswa = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("tb_siswa")
        .select("nisn, nama_siswa, kelas")
        .eq("id_guru", resolvedParams.id_guru)
        .order("nama_siswa");

      if (fetchError) throw fetchError;
      setAssignedSiswa(data || []);
    } catch (fetchError) {
      console.error("Error fetching assigned siswa:", fetchError);
      // Don't show error for this as it's optional data
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat detail guru...</p>
        </div>
      </div>
    );
  }

  if (!guru) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Guru tidak ditemukan
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Data guru yang Anda cari tidak ditemukan dalam sistem.
          </p>
          <div className="mt-6">
            <Link
              href="/admin/guru"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Daftar Guru
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <Link
              href="/admin/guru"
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back
            </Link>
            <div className="flex items-center">
              <User className="h-6 w-6 text-indigo-600 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">
                Detail Guru
              </h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Guru Information */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Informasi Guru
              </h3>
              <Link
                href={`/admin/guru/${guru.id_guru}/edit`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">ID Guru</dt>
                <dd className="mt-1 text-sm text-gray-900">{guru.id_guru}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Nama Guru</dt>
                <dd className="mt-1 text-sm text-gray-900">{guru.nama_guru}</dd>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Students */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
              Siswa Bimbingan ({assignedSiswa.length})
            </h3>

            {assignedSiswa.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Belum ada siswa bimbingan
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Guru ini belum memiliki siswa bimbingan yang ditugaskan.
                </p>
                <div className="mt-6">
                  <Link
                    href="/admin/pembimbing"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Kelola Pembimbing
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        NISN
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama Siswa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kelas
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assignedSiswa.map((siswa) => (
                      <tr key={siswa.nisn} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {siswa.nisn}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {siswa.nama_siswa}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {siswa.kelas}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/admin/siswa/${siswa.nisn}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Lihat Detail
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
