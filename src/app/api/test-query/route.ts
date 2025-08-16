import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { table, select, filter } = await request.json();
    const supabase = await createClient();

    console.log("Test query:", { table, select, filter });

    let query = supabase.from(table).select(select);

    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { data, error } = await query;

    console.log("Query result:", { data, error });

    if (error) {
      return NextResponse.json(
        { success: false, error: error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data,
      count: data?.length || 0,
    });
  } catch (error) {
    console.error("Test query error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Test query endpoint" });
}
