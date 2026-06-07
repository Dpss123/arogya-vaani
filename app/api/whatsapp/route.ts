import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

// Verify Meta's X-Hub-Signature-256 (HMAC-SHA256 of the raw body with the app
// secret). Skipped only when META_APP_SECRET is unset (local dev).
function verifySignature(raw: string, header: string | null): boolean {
  const secret = process.env.META_APP_SECRET;
  if (!secret) return true; // dev: no secret configured
  if (!header) return false;
  const expected = "sha256=" + crypto.createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

const GREETINGS = ["hi", "hii", "hello", "hey", "menu", "start", "namaste", "namaskar", "help", "00", "back", "wapas"];

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    if (!verifySignature(raw, req.headers.get("x-hub-signature-256"))) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
    const body = JSON.parse(raw);
    const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return NextResponse.json({ status: "no message" });

    const from: string = message.from;
    const type: string = message.type;

    const { sendWhatsAppMessage, sendEmergencyAlert, downloadWhatsAppMedia } = await import("@/lib/whatsapp");
    const { sendMainMenu, startService, handlePhq, handleScheme, doctorByLocation } = await import("@/lib/whatsappFlows");
    const { getSession, clearSession } = await import("@/lib/whatsappSession");
    const { askGemini, askGeminiVision } = await import("@/lib/gemini");
    const { CHAT_SYSTEM_PROMPT, REPORT_READER_PROMPT } = await import("@/lib/prompts");
    const { saveMessage, getConversationHistory, saveTriageResult, getOrCreatePatient } = await import("@/lib/supabase");
    const { hasEmergencyKeywords } = await import("@/lib/utils");

    await getOrCreatePatient(from);
    const session = await getSession(from);

    // ── Location → doctor finder ──
    if (type === "location" && message.location) {
      if (session.flow === "doctor") {
        await doctorByLocation(from, message.location.latitude, message.location.longitude);
      } else {
        await sendWhatsAppMessage(from, "📍 Location mili. Nazdeeki clinic dhundhne ke liye *menu* se '📍 Doctor dhundo' chunein.");
      }
      return NextResponse.json({ status: "ok" });
    }

    // ── Image / document → Vision report reader ──
    if (type === "image" || type === "document") {
      const mediaId = message.image?.id || message.document?.id;
      if (mediaId) {
        const buf = await downloadWhatsAppMedia(mediaId);
        if (buf) {
          const reply = await askGeminiVision(buf.toString("base64"), "image/jpeg", REPORT_READER_PROMPT);
          await sendWhatsAppMessage(from, reply);
          await saveMessage(from, "ai", reply);
        }
      }
      await clearSession(from);
      return NextResponse.json({ status: "ok" });
    }

    // ── Resolve text + any tappable selection ──
    let text = "";
    let selectionId = "";
    if (type === "text") {
      text = message.text?.body || "";
    } else if (type === "interactive") {
      const i = message.interactive;
      selectionId = i?.button_reply?.id || i?.list_reply?.id || "";
      text = i?.button_reply?.title || i?.list_reply?.title || "";
    } else if (type === "audio" || type === "voice") {
      const mediaId = message.audio?.id || message.voice?.id;
      const buf = mediaId ? await downloadWhatsAppMedia(mediaId) : null;
      if (buf) {
        const { transcribeAudio } = await import("@/lib/whisper");
        text = await transcribeAudio(buf);
        if (text) await sendWhatsAppMessage(from, `🎙️ _Aapne kaha: "${text}"_`);
      }
    }

    // ── 1. Emergency keywords (highest priority) ──
    if (text && hasEmergencyKeywords(text)) {
      await sendEmergencyAlert(from, text);
      await saveTriageResult(from, text, "emergency", "Emergency — 108 alert bheja");
      await clearSession(from);
      return NextResponse.json({ status: "emergency" });
    }

    // ── 2. Global menu commands ──
    if (selectionId === "" && GREETINGS.includes(text.trim().toLowerCase())) {
      await clearSession(from);
      await sendMainMenu(from);
      return NextResponse.json({ status: "ok" });
    }

    // ── 3. Menu selection → start a service ──
    if (selectionId.startsWith("svc_")) {
      const handled = await startService(selectionId, from);
      if (!handled) await sendMainMenu(from);
      return NextResponse.json({ status: "ok" });
    }

    // ── 4. Mid-flow routing ──
    if (session.flow === "phq9") {
      const scores = (session.data.scores as number[]) || [];
      await handlePhq(from, session.step, scores, selectionId || text);
      return NextResponse.json({ status: "ok" });
    }
    if (session.flow === "scheme") {
      if (!text.trim()) { await sendWhatsAppMessage(from, "Apni umar, income aur state likhein."); return NextResponse.json({ status: "ok" }); }
      await handleScheme(from, text);
      return NextResponse.json({ status: "ok" });
    }
    if (session.flow === "doctor") {
      await sendWhatsAppMessage(from, "📍 Doctor dhundhne ke liye apni *location share karein*: 📎 → Location → Send your current location.");
      return NextResponse.json({ status: "ok" });
    }

    // ── 4b. Any other tap/selection with no matching flow (stale / expired) → menu ──
    if (selectionId) {
      await sendMainMenu(from);
      return NextResponse.json({ status: "ok" });
    }

    // ── 5. Default: free-text AI chat (multi-turn) ──
    if (!text.trim()) {
      await sendMainMenu(from);
      return NextResponse.json({ status: "ok" });
    }
    await saveMessage(from, "patient", text);
    const history = await getConversationHistory(from, 6);
    const historyText = history
      .map((m: { role: string; content: string }) => `${m.role === "patient" ? "Patient" : "AI"}: ${m.content}`)
      .join("\n");
    const prompt = `${CHAT_SYSTEM_PROMPT}\n\nPrevious:\n${historyText}\n\nPatient: "${text}"\n\nResponse (Hindi, 3-4 lines). End by suggesting they type 'menu' for more services:`;
    const reply = await askGemini(prompt);
    await sendWhatsAppMessage(from, reply);
    await saveMessage(from, "ai", reply);

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({ status: "error" });
  }
}
