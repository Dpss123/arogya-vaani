import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { score, answers, type } = await req.json();
    const { askGemini } = await import("@/lib/gemini");
    const CFG: Record<string, { name: string; max: number; threshold: number; crisisIndex: number; helplines: string }> = {
      phq9: { name: "PHQ-9 depression", max: 27, threshold: 15, crisisIndex: 8, helplines: "iCall 9152987821, Vandrevala 1860-2662-345, KIRAN 1800-599-0019" },
      gad7: { name: "GAD-7 anxiety", max: 21, threshold: 10, crisisIndex: -1, helplines: "iCall 9152987821, Vandrevala 1860-2662-345, KIRAN 1800-599-0019" },
      epds: { name: "EPDS postpartum (PPD) depression", max: 30, threshold: 10, crisisIndex: 9, helplines: "KIRAN 1800-599-0019, Vandrevala 1860-2662-345, aur ASHA worker se baat" },
      farmer: { name: "kisan/financial stress", max: 18, threshold: 6, crisisIndex: 5, helplines: "Kisan Call Center 1800-180-1551, KIRAN 1800-599-0019, Vandrevala 1860-2662-345" },
    };
    const c = CFG[type] || CFG.phq9;
    const answersText = Array.isArray(answers) ? answers.join(", ") : "";
    // Detect an endorsed self-harm item regardless of total score.
    const crisis = Array.isArray(answers) && c.crisisIndex >= 0 && Number(answers[c.crisisIndex]) > 0;
    const prompt = `Patient ne ${c.name} screening test diya. Total score: ${score}/${c.max}. Answers: ${answersText}.
Hindi mein 3-4 lines ka warm, non-judgmental, supportive advice do.${crisis
      ? ` IMPORTANT: patient ne khud ko nuksan (self-harm) ka khayal bataya hai — "aap theek hain" jaisa reassuring MAT bolo. Gently par seriously bolo aur helpline numbers (${c.helplines}) zaroor do.`
      : ` Agar score >= ${c.threshold} hai toh helpline numbers (${c.helplines}) zaroor include karo.`}${type === "farmer" ? " Yeh kisan/financial stress hai — debt/government scheme support bhi mention karo." : ""}`;
    const advice = await askGemini(prompt);
    return NextResponse.json({ advice });
  } catch (error) {
    console.error("Mental health API error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
