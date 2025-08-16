import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get current UTC time
    const nowUTC = new Date();

    // Convert to WIB/Jakarta time using proper timezone conversion
    const nowWIB = new Date(nowUTC.getTime() + 7 * 60 * 60 * 1000);

    // Format Jakarta time for display
    const jakartaTimeString = nowWIB
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    // Get just time (HH:MM:SS)
    const timeOnly = nowWIB.toISOString().slice(11, 19);

    // Get hour for business logic (use WIB hour, not UTC hour)
    const hour = nowWIB.getUTCHours(); // This is actually WIB hour since we added 7 hours

    console.log("Time API Debug:", {
      utc: nowUTC.toISOString(),
      wib: nowWIB.toISOString(),
      wib_hour: hour,
      current_time: new Date().toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
      }),
    });

    return NextResponse.json({
      success: true,
      datetime: nowWIB.toISOString(),
      timezone: "Asia/Jakarta",
      utc_offset: "+07:00",
      source: "utc-plus-7-corrected",
      timestamp: nowWIB.getTime(),
      formatted: jakartaTimeString,
      time_only: timeOnly,
      hour_24: hour,
      jakarta_time: true,
      wib_time: true,
      debug: {
        utc_time: nowUTC.toISOString(),
        wib_calculated: jakartaTimeString,
        hour_number: hour,
        local_jakarta_string: new Date().toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
        }),
      },
    });
  } catch (error) {
    console.error("Server time API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to get server time",
        fallback: true,
      },
      { status: 500 }
    );
  }
}
