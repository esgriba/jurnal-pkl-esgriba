"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, Calendar, MapPin, Eye } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import DashboardLayout from "@/components/ui/DashboardLayout";

interface UserData {
  id: number;
  username: string;
  nama: string;
  role: string;
}

interface JurnalData {
  id_jurnal: string;
  tanggal: string;
  deskripsi_kegiatan: string;
  lokasi: string;
  evadir_personal: string;
  evadir_sosial: string;
  foto_kegiatan: string;
}

export default function JurnalListPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [journals, setJournals] = useState<JurnalData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

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
    fetchJournals(parsedUser.username);
  }, [router]);

  const fetchJournals = async (username: string) => {
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
      const { data: siswaData, error: siswaError } = await supabase
        .from("tb_siswa")
        .select("nisn")
        .eq("nama_siswa", userData.nama)
        .single();

      if (siswaError) {
        console.error("Error fetching siswa data:", siswaError);
        return;
      }

      // Now fetch journals using the NISN
      const { data, error } = await supabase
        .from("tb_jurnal")
        .select("*")
        .eq("nisn", siswaData.nisn)
        .order("tanggal", { ascending: false });

      if (error) {
        console.error("Error fetching journals:", error);
        return;
      }

      setJournals(data || []);
    } catch (error) {
      console.error("Error in fetchJournals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardLayout userRole="siswa">
        {/* iOS Style Clean Header */}
        <div className="bg-white border-b border-gray-200 mb-8">
          <div className="px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
                  Jurnal
                </h1>
                <p className="mt-1 text-gray-600 font-medium">
                  {journals.length}{" "}
                  {journals.length === 1 ? "jurnal" : "jurnal"}
                </p>
              </div>
              <Link
                href="/siswa/jurnal/create"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Buat
              </Link>
            </div>
          </div>
        </div>

        {/* iOS Style Journal List */}
        <div className="px-6">
          {journals.length === 0 ? (
            <div className="text-center py-20">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Calendar className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Belum Ada Jurnal
              </h3>
              <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                Mulai dokumentasikan kegiatan PKL Anda dengan membuat jurnal
                pertama.
              </p>
              <Link
                href="/siswa/jurnal/create"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 inline-flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Buat Jurnal Pertama
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {journals.map((journal) => (
                <div
                  key={journal.id_jurnal}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow duration-200"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-3">
                          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                            {format(parseISO(journal.tanggal), "dd MMM yyyy", {
                              locale: id,
                            })}
                          </span>
                          {journal.lokasi && (
                            <span className="ml-3 text-sm text-gray-500 flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {journal.lokasi}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
                          {journal.deskripsi_kegiatan}
                        </h3>
                        <div className="space-y-2">
                          {journal.evadir_personal && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">
                                Evaluasi Personal:
                              </span>{" "}
                              <span className="text-gray-800">
                                {journal.evadir_personal}
                              </span>
                            </div>
                          )}
                          {journal.evadir_sosial && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">
                                Evaluasi Sosial:
                              </span>{" "}
                              <span className="text-gray-800">
                                {journal.evadir_sosial}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-6 flex-shrink-0">
                        <Link
                          href={`/siswa/jurnal/${journal.id_jurnal}`}
                          className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200 inline-flex items-center"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </div>
  );
}
