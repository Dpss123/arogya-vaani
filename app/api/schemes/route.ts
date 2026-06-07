import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { profile } = await req.json();
    const { askGemini } = await import("@/lib/gemini");
    const prompt = `Patient profile: ${JSON.stringify(profile)}
Uttarakhand/India mein is patient ke liye available govt health schemes batao.
Hindi mein, simple language mein, har scheme ke liye: naam, benefit, eligibility, aur apply kaise karein.
Maximum 5 most relevant schemes batao.`;
    const result = await askGemini(prompt);
    return NextResponse.json({ schemes: result });
  } catch (error) {
    console.error("Schemes API error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
