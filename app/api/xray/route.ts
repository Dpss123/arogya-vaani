import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Forwards an uploaded chest X-ray to the Python ML service (XRAY_SERVICE_URL).
// Returns a clear "not configured" response when the service URL is unset, so
// the UI can show a setup message instead of an error.
export async function POST(req: NextRequest) {
  const serviceUrl = process.env.XRAY_SERVICE_URL;
  if (!serviceUrl) {
    return NextResponse.json(
      { configured: false, error: "X-ray AI service abhi setup nahi hai." },
      { status: 503 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const fwd = new FormData();
    fwd.append("file", file, file.name || "xray.jpg");

    const res = await fetch(`${serviceUrl.replace(/\/$/, "")}/predict`, {
      method: "POST",
      body: fwd,
      signal: AbortSignal.timeout(60000), // allow for free-tier cold starts
    });
    if (!res.ok) {
      return NextResponse.json({ error: "X-ray service error" }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json({ configured: true, ...data });
  } catch (err) {
    console.error("X-ray API error:", err);
    return NextResponse.json({ error: "X-ray analysis failed (service down?)" }, { status: 500 });
  }
}
