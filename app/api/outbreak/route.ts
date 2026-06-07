import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { symptoms, location, pincode } = await req.json();
    const { askGemini } = await import("@/lib/gemini");
    const { OUTBREAK_PROMPT } = await import("@/lib/prompts");
    const raw = await askGemini(OUTBREAK_PROMPT(symptoms, location));
    const result = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return NextResponse.json({ ...result, pincode, location });
  } catch (error) {
    console.error("Outbreak API error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}

// Real cluster detection: group the last 72h of triage reports by location and
// flag any place with a spike of the same symptom. (Demo thresholds; the
// research-paper target is 50+ in one PIN — change CRITICAL below for prod.)
export async function GET() {
  try {
    const { getRecentTriageWithLocation } = await import("@/lib/supabase");
    const rows = await getRecentTriageWithLocation(72);

    // Cluster at the finest location available: PIN code → village → district.
    const groups: Record<string, typeof rows> = {};
    for (const r of rows) {
      const key = r.pincode || r.village || r.district || "Unknown";
      (groups[key] ||= []).push(r);
    }

    const clusters = Object.entries(groups)
      .map(([key, list], i) => {
        const first = list[0];
        const location = first.village
          ? `${first.village}${first.district ? ", " + first.district : ""}`
          : (first.district || key);
        const cases = list.length;
        // Dominant symptom keyword across the group.
        const freq: Record<string, number> = {};
        for (const r of list) {
          for (const w of String(r.symptoms || "").toLowerCase().split(/\s+/)) {
            if (w.length > 3) freq[w] = (freq[w] || 0) + 1;
          }
        }
        const disease = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || "viral";
        const risk = cases >= 10 ? "CRITICAL" : cases >= 5 ? "HIGH" : cases >= 3 ? "MEDIUM" : "LOW";
        return {
          id: String(i + 1),
          location,
          disease,
          cases,
          risk,
          pincode: first.pincode || "—",
          last_reported: list[0]?.created_at || null,
          alert_sent: risk === "CRITICAL",
        };
      })
      .filter(c => c.cases >= 3)
      .sort((a, b) => b.cases - a.cases);

    return NextResponse.json({ clusters });
  } catch {
    return NextResponse.json({ clusters: [] });
  }
}
