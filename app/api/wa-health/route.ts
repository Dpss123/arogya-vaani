import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Lightweight diagnostic: checks whether the PRODUCTION Meta WhatsApp token is
// still valid, by calling the Graph API server-side. Returns ONLY a verdict +
// Meta's error message (never the token itself). Safe to remove once debugged.
export async function GET() {
  const token = process.env.META_WHATSAPP_TOKEN;
  const phoneId = process.env.META_PHONE_NUMBER_ID;
  if (!token || !phoneId) {
    return NextResponse.json({ ok: false, reason: "env-missing", hasToken: !!token, hasPhoneId: !!phoneId });
  }
  try {
    const res = await fetch(`https://graph.facebook.com/v18.0/${phoneId}?fields=verified_name,quality_rating`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({} as Record<string, unknown>));
    if (res.ok) {
      return NextResponse.json({ ok: true, tokenValid: true, verified_name: data.verified_name, quality: data.quality_rating });
    }
    const err = (data as { error?: { message?: string; code?: number } }).error;
    return NextResponse.json({ ok: false, tokenValid: false, httpStatus: res.status, code: err?.code ?? null, metaError: err?.message ?? null });
  } catch (e) {
    return NextResponse.json({ ok: false, reason: "fetch-failed", error: String(e) });
  }
}
