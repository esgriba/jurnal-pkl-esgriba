"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/ui/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

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

interface UserData {
  id: number;
  username: string;
  nama: string;
  role: string;
}

export default function JurnalDetailSiswaPage() {
  const [jurnal, setJurnal] = useState<JurnalDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>("");
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();

  // Utility function to check if location is coordinates
  const isCoordinates = (location: string): boolean => {
    const coordPattern = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/;
    return coordPattern.test(location.trim());
  };

  // Function to get address from coordinates
  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      setIsLoadingAddress(true);
      // Using OpenStreetMap Nominatim API (free alternative to Google Geocoding)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();

      if (data && data.display_name) {
        setLocationAddress(data.display_name);
      } else {
        setLocationAddress("Alamat tidak ditemukan");
      }
    } catch (error) {
      console.error("Error getting address:", error);
      setLocationAddress("Gagal mendapatkan alamat");
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Function to open Google Maps
  const openGoogleMaps = (location: string) => {
    if (isCoordinates(location)) {
      const coords = location.split(",").map((c) => c.trim());
      const url = `https://www.google.com/maps?q=${coords[0]},${coords[1]}`;
      window.open(url, "_blank");
    } else {
      const url = `https://www.google.com/maps/search/${encodeURIComponent(
        location
      )}`;
      window.open(url, "_blank");
    }
  };

  useEffect(() => {
    checkUser();
    if (params.id) {
      fetchJurnalDetail(params.id as string);
    }
  }, [params.id]);

  // Check if location is coordinates and get address
  useEffect(() => {
    if (jurnal && jurnal.lokasi && isCoordinates(jurnal.lokasi)) {
      const coords = jurnal.lokasi.split(",").map((c) => parseFloat(c.trim()));
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        getAddressFromCoordinates(coords[0], coords[1]);
      }
    }
  }, [jurnal]);

  const checkUser = () => {
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

      // Verify that this jurnal belongs to the current user
      if (currentUser && data.nisn !== currentUser.username) {
        router.push("/siswa/jurnal");
        return;
      }

      setJurnal(data);
    } catch (error) {
      console.error("Error fetching jurnal detail:", error);
      router.push("/siswa/jurnal");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="siswa">
        <div className="flex items-center justify-center min-h-96">
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
      <DashboardLayout userRole="siswa">
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Jurnal Tidak Ditemukan
          </h3>
          <p className="text-gray-600 mb-6">
            Jurnal yang Anda cari tidak ditemukan atau tidak dapat diakses.
          </p>
          <Link
            href="/siswa/jurnal"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Daftar Jurnal
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <DashboardLayout userRole="siswa">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/siswa/jurnal"
              className="inline-flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Kembali
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Detail Jurnal PKL
              </h1>
              <p className="text-gray-600">Jurnal ID: {jurnal.id_jurnal}</p>
            </div>
          </div>
        </div>

        {/* Jurnal Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Deskripsi Kegiatan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-indigo-600" />
                  Deskripsi Kegiatan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {jurnal.deskripsi_kegiatan}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Evaluasi Diri */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-green-600">
                    <Star className="h-5 w-5 mr-2" />
                    Evaluasi Personal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {jurnal.evadir_personal.split(", ").map((item, index) => (
                      <div
                        key={index}
                        className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full mr-2 mb-2"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Sosial */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-600">
                    <Star className="h-5 w-5 mr-2" />
                    Evaluasi Sosial
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {jurnal.evadir_sosial.split(", ").map((item, index) => (
                      <div
                        key={index}
                        className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full mr-2 mb-2"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Info Umum */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-indigo-600" />
                  Informasi Jurnal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Tanggal</p>
                    <p className="text-gray-600">
                      {formatDate(jurnal.tanggal)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 mr-3 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Lokasi</p>
                    <div className="space-y-1">
                      <button
                        onClick={() => openGoogleMaps(jurnal.lokasi)}
                        className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer flex items-center gap-1 text-left"
                      >
                        <span>{jurnal.lokasi}</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>

                      {isCoordinates(jurnal.lokasi) && (
                        <div className="mt-2">
                          {isLoadingAddress ? (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400"></div>
                              <span>Mencari alamat...</span>
                            </div>
                          ) : locationAddress ? (
                            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border-l-2 border-blue-200">
                              <p className="font-medium text-gray-700 mb-1">
                                📍 Alamat:
                              </p>
                              <p className="leading-relaxed">
                                {locationAddress}
                              </p>
                            </div>
                          ) : null}
                        </div>
                      )}

                      {!isCoordinates(jurnal.lokasi) && (
                        <p className="text-xs text-gray-500 mt-1">
                          Klik untuk cari di Google Maps
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-sm">
                  <User className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Siswa</p>
                    <p className="text-gray-600">{jurnal.nama_siswa}</p>
                    <p className="text-xs text-gray-500">NISN: {jurnal.nisn}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info Pembimbing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="h-5 w-5 mr-2 text-green-600" />
                  Pembimbing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm">
                  <UserCheck className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Guru Pembimbing</p>
                    <p className="text-gray-600">{jurnal.nama_guru}</p>
                  </div>
                </div>

                <div className="flex items-center text-sm">
                  <Building2 className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">DUDI</p>
                    <p className="text-gray-600">{jurnal.nama_dudi}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info Akademik */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-purple-600" />
                  Info Akademik
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Tahun Pelajaran
                  </p>
                  <p className="text-sm text-gray-600">
                    {jurnal.tahun_pelajaran}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Semester</p>
                  <p className="text-sm text-gray-600">{jurnal.semester}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Dibuat pada
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatDate(jurnal.created_at)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
