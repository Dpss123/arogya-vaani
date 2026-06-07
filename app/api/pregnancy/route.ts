import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { week, symptoms } = await req.json();
    if (!week) return NextResponse.json({ error: "Week required" }, { status: 400 });
    const { askGemini } = await import("@/lib/gemini");
    const { PREGNANCY_PROMPT } = await import("@/lib/prompts");
    let prompt = PREGNANCY_PROMPT(Number(week));
    if (symptoms) {
      prompt += `\n\nPatient ne yeh symptoms bataye hain: "${symptoms}"\nKya yeh normal hai is week mein? Agar nahi toh kya karna chahiye?`;
    }
    const advice = await askGemini(prompt);
    return NextResponse.json({ advice, week });
  } catch (err) {
    console.error("Pregnancy API error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
