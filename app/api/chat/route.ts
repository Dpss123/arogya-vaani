import { NextRequest } from "next/server";
import { askGeminiStream } from "@/lib/gemini";
import { CHAT_SYSTEM_PROMPT } from "@/lib/prompts";
import { langInstruction } from "@/lib/lang";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { message, history, lang } = await req.json();
  if (!message) return new Response(JSON.stringify({ error: "No message" }), { status: 400 });

  const historyText = (history || [])
    .map((m: { role: string; content: string }) => `${m.role === "patient" ? "Patient" : "AI"}: ${m.content}`)
    .join("\n");

  const prompt = `${CHAT_SYSTEM_PROMPT}

Previous conversation:
${historyText}

Patient: "${message}"

Response (3-4 lines max, warm tone):${langInstruction(lang)}`;

  // Stream the reply token-by-token so it appears instantly in the chat UI.
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of askGeminiStream(prompt)) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch {
        // askGeminiStream already handles its own fallbacks; this is a last resort
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
