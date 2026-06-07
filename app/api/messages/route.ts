import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    if (!phone) return NextResponse.json({ messages: [] });
    const { getAllMessages } = await import("@/lib/supabase");
    const messages = await getAllMessages(phone, limit);
    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ messages: [] });
  }
}
