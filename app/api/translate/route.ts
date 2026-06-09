import { askGemini } from "@/lib/gemini";
import { LANGUAGES } from "@/lib/lang";

// Batch UI translation. The client sends the source (Hinglish) labels it needs
// in the chosen language; Gemini returns them, and the client caches per-lang.
export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { texts, lang } = await req.json();
    if (!Array.isArray(texts) || texts.length === 0 || typeof lang !== "string") {
      return Response.json({ translations: [] });
    }
    // Hinglish is the source language — nothing to translate.
    if (lang === "hinglish") {
      return Response.json({ translations: texts });
    }

    const info = LANGUAGES.find((l) => l.code === lang);
    const target = info?.label || lang;

    const numbered = texts.map((t, i) => `${i + 1}. ${String(t)}`).join("\n");
    const prompt = `Translate these short UI labels for a healthcare app used by rural Indians into ${target}.
Rules:
- Keep each translation short and natural, like an app button or label.
- Keep brand names and technical tokens unchanged: "AI", "X-ray", "PHQ-9", "GAD-7", "PPD", "WHO", "GPS", "108", "Gemini", "Groq", "ASHA", "ABHA", "BP".
- Do NOT translate numbers or codes.
- Return ONLY a JSON array of the translated strings, in the SAME order and SAME count. No commentary, no markdown.

${numbered}`;

    const raw = await askGemini(prompt);

    let translations: string[] = [];
    const m = raw.match(/\[[\s\S]*\]/);
    if (m) {
      try {
        const parsed = JSON.parse(m[0]);
        if (Array.isArray(parsed)) translations = parsed.map((x) => String(x));
      } catch { /* fall through to source fallback */ }
    }
    // Length mismatch or parse failure → fall back to source so the UI never breaks.
    if (translations.length !== texts.length) {
      translations = texts.map(String);
    }

    return Response.json({ translations });
  } catch {
    return Response.json({ translations: [] });
  }
}
