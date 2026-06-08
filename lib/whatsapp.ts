// ============================================
// META WHATSAPP CLOUD API
// Replaces Twilio — completely FREE (1000 msgs/month)
// Setup: developers.facebook.com/docs/whatsapp
// ============================================

const META_API_URL = "https://graph.facebook.com/v18.0";
const PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID!;
const TOKEN = process.env.META_WHATSAPP_TOKEN!;

// Truncate by code points so we never split an emoji into a lone surrogate
// (which Meta rejects as invalid UTF-8).
function cut(s: string, n: number): string {
  return [...(s || "")].slice(0, n).join("");
}

// Send text message. Auto-splits at WhatsApp's 4096-char body limit (model
// replies can be long) and logs any Meta rejection instead of failing silently.
export async function sendWhatsAppMessage(to: string, message: string) {
  const MAX = 3900;
  const cps = [...(((message || "").trim()) || "…")];
  const chunks: string[] = [];
  for (let i = 0; i < cps.length; i += MAX) chunks.push(cps.slice(i, i + MAX).join(""));
  let last: unknown;
  for (const body of chunks) {
    try {
      const res = await fetch(`${META_API_URL}/${PHONE_NUMBER_ID}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ messaging_product: "whatsapp", to: to.replace("+", ""), type: "text", text: { body } }),
      });
      const data = await res.json();
      if (!res.ok) console.error("WhatsApp send rejected:", JSON.stringify(data));
      last = data;
    } catch (error) {
      console.error("WhatsApp send error:", error);
    }
  }
  return last;
}

// Low-level interactive sender (tappable buttons / list).
async function sendInteractive(to: string, interactive: object) {
  try {
    const res = await fetch(`${META_API_URL}/${PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to.replace("+", ""),
        type: "interactive",
        interactive,
      }),
    });
    const data = await res.json();
    if (!res.ok) console.error("WhatsApp interactive rejected:", JSON.stringify(data));
    return data;
  } catch (error) {
    console.error("WhatsApp interactive error:", error);
  }
}

// Up to 3 tappable reply buttons.
export async function sendWhatsAppButtons(
  to: string,
  body: string,
  buttons: { id: string; title: string }[]
) {
  return sendInteractive(to, {
    type: "button",
    body: { text: cut(body, 1024) },
    action: {
      buttons: buttons.slice(0, 3).map((b) => ({
        type: "reply",
        reply: { id: b.id, title: cut(b.title, 20) },
      })),
    },
  });
}

// Tappable list (up to 10 rows) — used for the main menu / PHQ-9 options.
export async function sendWhatsAppList(
  to: string,
  body: string,
  buttonText: string,
  rows: { id: string; title: string; description?: string }[],
  opts?: { header?: string; footer?: string; sectionTitle?: string }
) {
  return sendInteractive(to, {
    type: "list",
    ...(opts?.header ? { header: { type: "text", text: cut(opts.header, 60) } } : {}),
    body: { text: cut(body, 1024) },
    ...(opts?.footer ? { footer: { text: cut(opts.footer, 60) } } : {}),
    action: {
      button: cut(buttonText, 20),
      sections: [
        {
          title: cut(opts?.sectionTitle || "Services", 24),
          rows: rows.slice(0, 10).map((r) => ({
            id: cut(r.id, 200),
            title: cut(r.title, 24),
            ...(r.description ? { description: cut(r.description, 72) } : {}),
          })),
        },
      ],
    },
  });
}

// Send emergency alert with 108 number
export async function sendEmergencyAlert(to: string, symptoms: string) {
  const message = `🚨 *EMERGENCY DETECTED*

Aapke symptoms serious hain:
_${symptoms}_

*TURANT 108 call karein* — Free ambulance service

Apna location share karein:
📍 wa.me/send?phone=918xxxxxxxx

Arogya Vaani Emergency Response`;

  return sendWhatsAppMessage(to, message);
}

// Send triage result
export async function sendTriageResult(
  to: string,
  verdict: string,
  advice: string,
  color: string
) {
  const emoji = color === "red" ? "🔴" : color === "yellow" ? "🟡" : "🟢";
  const message = `${emoji} *AROGYA VAANI TRIAGE*

${advice}

━━━━━━━━━━━━━━
⚠️ _Yeh AI advice hai. Doctor se zaroor milein._
📞 Emergency: 108 | helpline: 104`;

  return sendWhatsAppMessage(to, message);
}

// Send report summary
export async function sendReportSummary(to: string, summary: string) {
  const message = `📋 *AAPKI REPORT ANALYSIS*

${summary}

━━━━━━━━━━━━━━
⚠️ _Yeh AI analysis hai. Final diagnosis ke liye doctor se milein._`;

  return sendWhatsAppMessage(to, message);
}

// Download media from WhatsApp (voice notes, images, PDFs)
export async function downloadWhatsAppMedia(mediaId: string): Promise<Buffer | null> {
  try {
    // Get media URL
    const urlRes = await fetch(`${META_API_URL}/${mediaId}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    const urlData = await urlRes.json();

    // Download actual file
    const fileRes = await fetch(urlData.url, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    const buffer = Buffer.from(await fileRes.arrayBuffer());
    return buffer;
  } catch (error) {
    console.error("Media download error:", error);
    return null;
  }
}

// Parse incoming WhatsApp webhook message
export function parseWhatsAppWebhook(body: Record<string, unknown>) {
  try {
    const entry = (body.entry as Record<string, unknown>[])?.[0];
    const changes = (entry?.changes as Record<string, unknown>[])?.[0];
    const value = changes?.value as Record<string, unknown>;
    const message = (value?.messages as Record<string, unknown>[])?.[0];

    if (!message) return null;

    const from = message.from as string;
    const type = message.type as string;

    if (type === "text") {
      return {
        from,
        type: "text",
        text: (message.text as Record<string, unknown>)?.body as string,
        mediaId: null,
      };
    }

    if (type === "audio" || type === "voice") {
      return {
        from,
        type: "voice",
        text: null,
        mediaId: ((message.audio || message.voice) as Record<string, unknown>)?.id as string,
      };
    }

    if (type === "image") {
      return {
        from,
        type: "image",
        text: (message.image as Record<string, unknown>)?.caption as string || "",
        mediaId: (message.image as Record<string, unknown>)?.id as string,
      };
    }

    if (type === "document") {
      return {
        from,
        type: "document",
        text: (message.document as Record<string, unknown>)?.caption as string || "",
        mediaId: (message.document as Record<string, unknown>)?.id as string,
      };
    }

    return null;
  } catch {
    return null;
  }
}
