import { NextRequest, NextResponse } from "next/server";

// Persist a District Health Officer alert. Privileged write (service-role) →
// gated behind a logged-in session, with validated + bounded inputs.
export async function POST(req: NextRequest) {
  const token =
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { location, disease, risk, cases, pincode } = await req.json();
    if (typeof location !== "string" || !location.trim()) {
      return NextResponse.json({ error: "Invalid location" }, { status: 400 });
    }
    const loc = location.trim().slice(0, 200);
    const dis = String(disease || "").slice(0, 200);
    const validRisk = ["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(risk) ? risk : "LOW";
    const n = Number(cases);
    const caseCount = Number.isFinite(n) ? Math.max(0, Math.min(Math.floor(n), 1_000_000)) : 0;
    const pin = typeof pincode === "string" ? pincode.trim().slice(0, 12) : undefined;

    const { saveOutbreakAlert } = await import("@/lib/supabase");
    await saveOutbreakAlert(loc, dis, validRisk, caseCount, pin);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DHO alert error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
