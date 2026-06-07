import { NextRequest, NextResponse } from "next/server";
import { askGemini } from "@/lib/gemini";
import { CHAT_SYSTEM_PROMPT } from "@/lib/prompts";
import { langInstruction } from "@/lib/lang";

export async function POST(req: NextRequest) {
  const { message, history, lang } = await req.json();
  if (!message) return NextResponse.json({ error: "No message" }, { status: 400 });

  const historyText = (history || [])
    .map((m: { role: string; content: string }) => `${m.role === "patient" ? "Patient" : "AI"}: ${m.content}`)
    .join("\n");

  const prompt = `${CHAT_SYSTEM_PROMPT}

Previous conversation:
${historyText}

Patient: "${message}"

Response (3-4 lines max, warm tone):${langInstruction(lang)}`;

  const reply = await askGemini(prompt);
  return NextResponse.json({ reply });
}
