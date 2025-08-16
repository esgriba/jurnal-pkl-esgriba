"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/Toast";
import {
  Building2,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  Filter,
  MapPin,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Dudi {
  id_dudi: string;
  nama_dudi: string;
  alamat_dudi?: string;
  kontak_dudi?: string;
  lokasi_map?: string;
}

export default function AdminDudiPage() {
  const [dudi, setDudi] = useState<Dudi[]>([]);
  const [filteredDudi, setFilteredDudi] = useState<Dudi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();
  const { error, success } = useToast();

  useEffect(() => {
    checkUser();
    fetchDudi();
  }, []);

  useEffect(() => {
    filterDudi();
  }, [dudi, searchTerm]);

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

  const fetchDudi = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("tb_dudi")
        .select("*")
        .order("nama_dudi");

      if (fetchError) throw fetchError;
      setDudi(data || []);
    } catch (fetchError) {
      console.error("Error fetching dudi:", fetchError);
      error("Gagal memuat data DUDI");
    } finally {
      setIsLoading(false);
    }
  };

  const filterDudi = () => {
    if (!searchTerm) {
      setFilteredDudi(dudi);
      return;
    }

    const filtered = dudi.filter(
      (d) =>
        d.id_dudi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.nama_dudi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.alamat_dudi &&
          d.alamat_dudi.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredDudi(filtered);
  };

  const handleDelete = async (id_dudi: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data DUDI ini?")) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from("tb_dudi")
        .delete()
        .eq("id_dudi", id_dudi);

      if (deleteError) throw deleteError;

      success("Data DUDI berhasil dihapus");
      fetchDudi();
    } catch (deleteError) {
      console.error("Error deleting dudi:", deleteError);
      error("Gagal menghapus data DUDI");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data DUDI...</p>
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
              href="/admin/dashboard"
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back
            </Link>
            <div className="flex items-center">
              <Building2 className="h-6 w-6 text-indigo-600 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">
                Manajemen DUDI
              </h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Filters and Actions */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari ID, nama, atau alamat DUDI..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-80"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Add DUDI Button */}
              <Link
                href="/admin/dudi/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah DUDI
              </Link>
            </div>
          </div>
        </div>

        {/* DUDI Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Daftar DUDI ({filteredDudi.length})
            </h3>

            {filteredDudi.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Tidak ada data DUDI
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm
                    ? "Tidak ditemukan DUDI yang sesuai dengan pencarian."
                    : "Mulai dengan menambahkan DUDI baru."}
                </p>
                {!searchTerm && (
                  <div className="mt-6">
                    <Link
                      href="/admin/dudi/create"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah DUDI
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID DUDI
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama DUDI
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Alamat
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kontak
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lokasi Map
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDudi.map((d) => (
                      <tr key={d.id_dudi} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {d.id_dudi}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {d.nama_dudi}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {d.alamat_dudi || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {d.kontak_dudi || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {d.lokasi_map &&
                          (d.lokasi_map.includes("maps.google.com") ||
                            d.lokasi_map.includes("maps.app.goo.gl") ||
                            d.lokasi_map.includes("goo.gl/maps")) ? (
                            <a
                              href={d.lokasi_map}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-full transition-colors duration-200"
                              title="Buka di Google Maps"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              href={`/admin/dudi/${d.id_dudi}`}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/admin/dudi/${d.id_dudi}/edit`}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(d.id_dudi)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
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
