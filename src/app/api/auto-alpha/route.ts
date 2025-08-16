import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Use Indonesian timezone (WIB = UTC+7)
    const nowUTC = new Date();
    const nowWIB = new Date(nowUTC.getTime() + 7 * 60 * 60 * 1000); // Add 7 hours for WIB
    const today = nowWIB.toISOString().split("T")[0];

    console.log("Auto Alpha API called at UTC:", nowUTC.toISOString());
    console.log(
      "Auto Alpha API called at WIB:",
      nowWIB.toLocaleString("id-ID")
    );
    console.log("Current hour WIB:", nowWIB.getHours());

    // Only run this after 3 PM WIB (15:00)
    if (nowWIB.getHours() < 15) {
      console.log("Auto Alpha called before 3 PM WIB, returning early message");
      return NextResponse.json(
        {
          message: `Auto Alpha hanya berjalan setelah jam 15:00 WIB. Sekarang jam ${nowWIB.getHours()}:${String(
            nowWIB.getMinutes()
          ).padStart(2, "0")} WIB`,
          currentHour: nowWIB.getHours(),
          processed: 0,
          time: nowWIB.toLocaleString("id-ID"),
        },
        { status: 200 }
      );
    }

    // Get all students
    const { data: students, error: studentsError } = await supabase
      .from("tb_siswa")
      .select("*");

    if (studentsError) {
      console.error("Error fetching students:", studentsError);
      throw studentsError;
    }

    console.log("Total students found:", students?.length || 0);

    // Get today's attendance records
    const { data: todayAttendance, error: attendanceError } = await supabase
      .from("tb_absensi")
      .select("nisn")
      .eq("tanggal", today);

    if (attendanceError) {
      console.error("Error fetching attendance:", attendanceError);
      throw attendanceError;
    }

    console.log(
      "Students already attended today:",
      todayAttendance?.length || 0
    );

    // Find students who haven't done attendance today
    const attendedNisns =
      todayAttendance?.map((record: any) => record.nisn) || [];
    const absentStudents =
      students?.filter(
        (student: any) => !attendedNisns.includes(student.nisn)
      ) || [];

    console.log("Students needing Alpha status:", absentStudents.length);

    // Create Alpha records for absent students
    const alphaRecords = absentStudents.map((student: any) => ({
      nisn: student.nisn,
      nama_siswa: student.nama_siswa,
      kelas: student.kelas,
      lokasi: null,
      id_dudi: student.id_dudi,
      nama_dudi: student.nama_dudi,
      tanggal: today,
      status: "Alpha",
      keterangan: "Otomatis - Tidak absen sampai jam 3 sore",
      id_guru: student.id_guru,
      nama_guru: student.nama_guru,
      jam_absensi: `${String(nowWIB.getHours()).padStart(2, "0")}:${String(
        nowWIB.getMinutes()
      ).padStart(2, "0")}:00`,
    }));

    let insertedCount = 0;

    if (alphaRecords.length > 0) {
      console.log(
        "Inserting Alpha records for",
        alphaRecords.length,
        "students"
      );

      const { error: insertError } = await supabase
        .from("tb_absensi")
        .insert(alphaRecords);

      if (insertError) {
        console.error("Error inserting Alpha records:", insertError);
        throw insertError;
      }
      insertedCount = alphaRecords.length;
      console.log("Successfully inserted", insertedCount, "Alpha records");
    } else {
      console.log("No students need Alpha status - all have attended");
    }

    return NextResponse.json(
      {
        message:
          insertedCount > 0
            ? "Auto Alpha process completed successfully"
            : "Semua siswa sudah melakukan absensi hari ini",
        processed: insertedCount,
        totalStudents: students?.length || 0,
        alreadyAttended: attendedNisns.length,
        time: nowWIB.toLocaleString("id-ID"),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in auto alpha process:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Also allow GET for testing
export async function GET() {
  return POST(new NextRequest("http://localhost/api/auto-alpha"));
}
