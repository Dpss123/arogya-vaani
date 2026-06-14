import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Pings the Hugging Face model Spaces so they don't fall asleep — this is what
// causes the slow (~60s) cold start on the first diagnostics request.
// Triggered by the Vercel cron in vercel.json, and ideally by a free external
// pinger (cron-job.org / UptimeRobot) every ~5-10 min for true warmth.
export async function GET() {
  const urls = [
    process.env.XRAY_SERVICE_URL,
    process.env.SKIN_SERVICE_URL,
    process.env.EYE_SERVICE_URL,
    process.env.DENTAL_SERVICE_URL,
  ].filter(Boolean) as string[];

  const results = await Promise.allSettled(
    urls.map((u) =>
      fetch(u.replace(/\/$/, ""), { method: "GET", signal: AbortSignal.timeout(20000) })
        .then((r) => ({ url: u, status: r.status }))
    )
  );
  const warmed = results.filter((r) => r.status === "fulfilled").length;

  return NextResponse.json(
    { ok: true, warmed, total: urls.length, at: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
