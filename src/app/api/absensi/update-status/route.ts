import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { id_absensi, status, keterangan } = body;

    // Validate required fields
    if (!id_absensi || !status) {
      return NextResponse.json(
        { error: "ID Absensi dan status harus diisi" },
        { status: 400 }
      );
    }

    // Validate status values
    const validStatuses = ["Hadir", "Sakit", "Izin", "Alpha"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: "Status tidak valid. Gunakan: Hadir, Sakit, Izin, atau Alpha",
        },
        { status: 400 }
      );
    }

    console.log("Updating absensi status:", { id_absensi, status, keterangan });

    // Update the attendance record
    const { data, error } = await supabase
      .from("tb_absensi")
      .update({
        status: status,
        keterangan: keterangan || null,
      })
      .eq("id_absensi", id_absensi)
      .select();

    if (error) {
      console.error("Error updating absensi:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Data absensi tidak ditemukan" },
        { status: 404 }
      );
    }

    console.log("Successfully updated absensi:", data[0]);

    return NextResponse.json({
      success: true,
      message: "Status absensi berhasil diupdate",
      data: data[0],
    });
  } catch (error) {
    console.error("Error in update-status API:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate status absensi" },
      { status: 500 }
    );
  }
}
