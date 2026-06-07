import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    const { askGemini, askGeminiVision } = await import("@/lib/gemini");
    const { MEDICINE_PROMPT } = await import("@/lib/prompts");

    let result = "";
    let medicineName = "Scanned medicine";
    let phone = "demo";
    let currentMeds = "";

    // When the patient lists medicines they already take, ask the AI to
    // cross-check for dangerous interactions (LLM-based — not a licensed DB).
    const interactionNote = (meds: string) =>
      meds.trim()
        ? `\n\nZAROORI — Patient pehle se yeh medicines le raha hai: "${meds}". Is nayi medicine aur in current medicines ke beech DANGEROUS INTERACTIONS check karo. Agar koi interaction risky hai toh 🔴 ke saath clearly warning do aur simple Hindi mein samjhao ki kya karna chahiye. Agar koi interaction nahi hai toh "✅ Koi major interaction nahi mila" likho.`
        : "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
      if (!file.type?.startsWith("image/")) return NextResponse.json({ error: "Image file required" }, { status: 400 });
      if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 8MB)" }, { status: 400 });
      phone = (formData.get("phone") as string) || "demo";
      currentMeds = (formData.get("currentMeds") as string) || "";
      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      result = await askGeminiVision(base64, file.type || "image/jpeg", MEDICINE_PROMPT + interactionNote(currentMeds));
    } else {
      const body = await req.json();
      medicineName = body.medicineName || medicineName;
      phone = body.phone || "demo";
      currentMeds = body.currentMeds || "";
      const prompt = `${MEDICINE_PROMPT}\n\nMedicine ka naam: "${medicineName}"\n\nPlease yeh medicine ke baare mein poori jaankari do.${interactionNote(currentMeds)}`;
      result = await askGemini(prompt);
    }

    // Persist the scan (best-effort).
    try {
      const { getOrCreatePatient, saveMedicineScan } = await import("@/lib/supabase");
      await getOrCreatePatient(phone);
      await saveMedicineScan(phone, medicineName, result);
    } catch (e) {
      console.error("Medicine persist error:", e);
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Medicine API error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
