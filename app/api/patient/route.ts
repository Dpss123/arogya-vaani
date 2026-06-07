import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    if (!phone) return NextResponse.json({ error: "Phone required" }, { status: 400 });
    const { getPatientByPhone } = await import("@/lib/supabase");
    const patient = await getPatientByPhone(phone);
    return NextResponse.json({ patient });
  } catch {
    return NextResponse.json({ patient: null });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, ...updates } = body;
    if (!phone) return NextResponse.json({ error: "Phone required" }, { status: 400 });
    const { updatePatient } = await import("@/lib/supabase");
    const patient = await updatePatient(phone, updates);
    return NextResponse.json({ patient });
  } catch (err) {
    console.error("Patient update error:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
