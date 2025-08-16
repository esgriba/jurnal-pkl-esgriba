import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import * as XLSX from "xlsx";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "No file uploaded",
          summary: {
            totalRows: 0,
            successfulInserts: 0,
            errors: 1,
            errorDetails: [
              {
                row: 0,
                error: "No file uploaded",
                data: {},
              },
            ],
          },
        },
        { status: 400 }
      );
    }

    // Read Excel file
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log("Excel data:", jsonData);

    if (!jsonData || jsonData.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "File Excel kosong atau tidak valid",
          summary: {
            totalRows: 0,
            successfulInserts: 0,
            errors: 1,
            errorDetails: [
              {
                row: 0,
                error: "File Excel kosong atau tidak valid",
                data: {},
              },
            ],
          },
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const processedData = [];
    const errors = [];

    // Process each row
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as any;

      try {
        // Validate required fields
        const requiredFields = {
          nisn: row.NISN || row.nisn || row.Nisn,
          nama_siswa:
            row["Nama Siswa"] || row.nama_siswa || row.Nama || row.nama,
          kelas: row.Kelas || row.kelas || row.Class,
          tahun_pelajaran:
            row["Tahun Pelajaran"] || row.tahun_pelajaran || "2024/2025",
          semester: row.Semester || row.semester || "Ganjil",
          id_dudi: row["ID DUDI"] || row.id_dudi || row.ID_DUDI,
          nama_dudi: row["Nama DUDI"] || row.nama_dudi || row.DUDI,
          id_guru: row["ID Guru"] || row.id_guru || row.ID_Guru,
          nama_guru: row["Nama Guru"] || row.nama_guru || row.Guru,
        };

        // Check for missing required fields
        const missingFields = [];
        if (!requiredFields.nisn) missingFields.push("NISN");
        if (!requiredFields.nama_siswa) missingFields.push("Nama Siswa");
        if (!requiredFields.kelas) missingFields.push("Kelas");
        if (!requiredFields.id_dudi) missingFields.push("ID DUDI");
        if (!requiredFields.nama_dudi) missingFields.push("Nama DUDI");
        if (!requiredFields.id_guru) missingFields.push("ID Guru");
        if (!requiredFields.nama_guru) missingFields.push("Nama Guru");

        if (missingFields.length > 0) {
          errors.push({
            row: i + 2, // +2 because Excel rows start from 1 and we skip header
            error: `Field yang diperlukan tidak ada: ${missingFields.join(
              ", "
            )}`,
            data: row,
          });
          continue;
        }

        // Validate field lengths to prevent database errors
        const fieldLimits: Record<string, number> = {
          nisn: 20,
          nama_siswa: 100, // Assuming generous limit
          kelas: 50, // Updated to match new database limit!
          tahun_pelajaran: 20,
          semester: 10,
          nama_dudi: 100, // Assuming generous limit
          id_guru: 50,
          nama_guru: 100, // Assuming generous limit
        };

        const lengthErrors: string[] = [];
        (
          Object.keys(fieldLimits) as Array<keyof typeof requiredFields>
        ).forEach((field) => {
          const value = requiredFields[field];
          const limit = fieldLimits[field];
          if (typeof value === "string" && value.length > limit) {
            lengthErrors.push(
              `${field} terlalu panjang (${value.length} chars, max ${limit}): "${value}"`
            );
          }
        });

        if (lengthErrors.length > 0) {
          errors.push({
            row: i + 2,
            error: `Field terlalu panjang: ${lengthErrors.join(", ")}`,
            data: row,
          });
          continue;
        }

        // Check if NISN already exists
        const { data: existingStudent } = await supabase
          .from("tb_siswa")
          .select("nisn")
          .eq("nisn", requiredFields.nisn)
          .single();

        if (existingStudent) {
          errors.push({
            row: i + 2,
            error: `NISN ${requiredFields.nisn} sudah ada di database`,
            data: row,
          });
          continue;
        }

        processedData.push(requiredFields);
      } catch (error) {
        errors.push({
          row: i + 2,
          error: `Error processing row: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          data: row,
        });
      }
    }

    // Insert valid data
    let insertedCount = 0;
    if (processedData.length > 0) {
      const { data, error: insertError } = await supabase
        .from("tb_siswa")
        .insert(processedData)
        .select();

      if (insertError) {
        console.error("Insert error:", insertError);
        return NextResponse.json(
          {
            error: "Error inserting data: " + insertError.message,
            details: insertError,
          },
          { status: 500 }
        );
      }

      insertedCount = data?.length || 0;
    }

    return NextResponse.json({
      success: true,
      message: `Import berhasil! ${insertedCount} siswa berhasil ditambahkan`,
      summary: {
        totalRows: jsonData.length,
        successfulInserts: insertedCount,
        errors: errors.length,
        errorDetails: errors,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error processing file",
        details: error instanceof Error ? error.message : "Unknown error",
        summary: {
          totalRows: 0,
          successfulInserts: 0,
          errors: 1,
          errorDetails: [
            {
              row: 0,
              error: error instanceof Error ? error.message : "Unknown error",
              data: {},
            },
          ],
        },
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Student import endpoint",
    exampleFormat: {
      columns: [
        "NISN",
        "Nama Siswa",
        "Kelas",
        "Tahun Pelajaran",
        "Semester",
        "ID DUDI",
        "Nama DUDI",
        "ID Guru",
        "Nama Guru",
      ],
    },
  });
}
