import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    if (!phone) return NextResponse.json({ reports: [] });
    const { getPatientReports } = await import("@/lib/supabase");
    const reports = await getPatientReports(phone);
    return NextResponse.json({ reports });
  } catch {
    return NextResponse.json({ reports: [] });
  }
}
