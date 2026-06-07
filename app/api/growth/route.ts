import { NextRequest, NextResponse } from "next/server";

// Growth STATUS is computed deterministically (WHO medians); the model only
// writes advice for the already-decided status.
export async function POST(req: NextRequest) {
  try {
    const { sex, ageMonths, weightKg, heightCm } = await req.json();
    if (!["male", "female"].includes(sex)) return NextResponse.json({ error: "Invalid sex" }, { status: 400 });
    const age = Number(ageMonths), w = Number(weightKg), h = Number(heightCm);
    if (![age, w, h].every(Number.isFinite) || age < 0 || age > 60 || w <= 0 || w > 40 || h <= 0 || h > 130) {
      return NextResponse.json({ error: "Invalid measurements" }, { status: 400 });
    }

    const { assessGrowth } = await import("@/lib/growth");
    const { askGemini } = await import("@/lib/gemini");
    const { GROWTH_ADVICE_PROMPT } = await import("@/lib/prompts");

    const assessment = assessGrowth(sex, age, w, h);
    const advice = await askGemini(GROWTH_ADVICE_PROMPT({ ...assessment, sex, weightKg: w, heightCm: h }));

    return NextResponse.json({ assessment, advice });
  } catch (e) {
    console.error("Growth API error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
