import { askGemini } from "./gemini";
import { interpretPHQ9 } from "./utils";
import { sendWhatsAppMessage, sendWhatsAppList, sendEmergencyAlert } from "./whatsapp";
import { setSession, clearSession } from "./whatsappSession";

// ── Main menu ───────────────────────────────
export async function sendMainMenu(to: string) {
  await sendWhatsAppList(
    to,
    "Namaste! 🙏 Main *Arogya Vaani* hoon.\n\nNiche se koi service chunein, ya seedha apni problem likh dein.",
    "Services dekhein",
    [
      { id: "svc_symptom", title: "🩺 Lakshan batao", description: "Symptom check + AI salah" },
      { id: "svc_report", title: "📋 Report / Photo", description: "X-ray, blood test, dawai padhwao" },
      { id: "svc_mental", title: "🧠 Mann ki jaanch", description: "Tanav, neend, mood (PHQ-9)" },
      { id: "svc_doctor", title: "🏥 Doctor dhundo", description: "Nazdeeki clinic / hospital" },
      { id: "svc_scheme", title: "🏛️ Govt schemes", description: "Free health yojana" },
      { id: "svc_emergency", title: "🚨 Emergency", description: "108 + first-aid" },
    ]
  );
}

// ── Service router (when a menu item is tapped) ──
export async function startService(id: string, phone: string): Promise<boolean> {
  switch (id) {
    case "svc_symptom":
      await clearSession(phone);
      await sendWhatsAppMessage(phone, "🩺 Apne lakshan vistaar se likhein — jaise _\"2 din se bukhar, sar dard aur khaansi\"_. Main aapko salah dunga.");
      return true;
    case "svc_report":
      await clearSession(phone);
      await sendWhatsAppMessage(phone, "📋 Apni report / X-ray / dawai ki *saaf photo* bhej dein. Main usse padh ke simple bhasha mein samjhaunga.");
      return true;
    case "svc_mental":
      await startMental(phone);
      return true;
    case "svc_doctor":
      await setSession(phone, { flow: "doctor", step: 0, data: {} });
      await sendWhatsAppMessage(phone, "🏥 Nazdeeki clinic dhundhne ke liye apni *location share karein*:\n\n📎 (attach) → *Location* → *Send your current location*");
      return true;
    case "svc_scheme":
      await setSession(phone, { flow: "scheme", step: 0, data: {} });
      await sendWhatsAppMessage(phone, "🏛️ Apni *umar, mahine ki income, aur state* batayein — jaise _\"45 saal, 8000/month, Uttar Pradesh\"_. Main eligible govt health schemes bataunga.");
      return true;
    case "svc_emergency":
      await clearSession(phone);
      await sendEmergencyAlert(phone, "Emergency madad chuni gayi");
      return true;
    default:
      return false;
  }
}

// ── Mental health (PHQ-9) ───────────────────
const PHQ9 = [
  "Kisi kaam ya cheez mein mann / maza nahi laga?",
  "Udaas, depressed, ya nirash mehsoos kiya?",
  "Neend mein dikkat — kam ya zyada soya?",
  "Thakaan ya bahut kam energy mehsoos ki?",
  "Bhookh kam ya zyada lagi?",
  "Apne baare mein bura mehsoos kiya (khud ko fail / dosh dena)?",
  "Kisi cheez par dhyaan lagane mein dikkat (TV, padhai, kaam)?",
  "Itna dheere bole/chale, ya itne bechain rahe ki logon ne notice kiya?",
  "Khud ko nuksan pahunchane ya na rehne (marne) ka khayal aaya?",
];

async function sendPhqQuestion(to: string, step: number) {
  await sendWhatsAppList(
    to,
    `*Mann ki jaanch (${step + 1}/9)*\n\nPichhle 2 hafte, kitni baar:\n${PHQ9[step]}`,
    "Jawab chunein",
    [
      { id: "phq_0", title: "0 · Bilkul nahi" },
      { id: "phq_1", title: "1 · Kuch din" },
      { id: "phq_2", title: "2 · Aadhe se zyada din" },
      { id: "phq_3", title: "3 · Lagbhag roz" },
    ]
  );
}

export async function startMental(phone: string) {
  const ok = await setSession(phone, { flow: "phq9", step: 0, data: { scores: [] } });
  if (!ok) {
    await sendWhatsAppMessage(phone, "🧠 Mann ki jaanch abhi shuru nahi ho payi (technical issue). Thodi der baad ya *menu* se dobara try karein.");
    return;
  }
  await sendWhatsAppMessage(phone, "🧠 *Mann ki jaanch (PHQ-9)* — 9 chhote sawaal, bilkul private aur free. Har sawaal ka jawab niche diye options mein se chunein.");
  await sendPhqQuestion(phone, 0);
}

// Handle a PHQ-9 answer (tap id "phq_2", typed digit "2", or a word like "har roz").
export async function handlePhq(phone: string, step: number, scores: number[], answer: string) {
  let score = NaN;
  const id = answer.match(/phq_([0-3])/);
  const t = answer.trim().toLowerCase();
  if (id) score = parseInt(id[1], 10);
  else if (/^[0-3]$/.test(t)) score = parseInt(t, 10);          // a lone 0-3 only ("10"/"45" rejected)
  else if (/bilkul nahi|kabhi nahi|nahi hua/.test(t)) score = 0;
  else if (/kuch din|kabhi[- ]?kabhi|thoda/.test(t)) score = 1;
  else if (/aadhe|adhe|half|zyada din/.test(t)) score = 2;
  else if (/lagbhag roz|har roz|har din|har waqt|daily|roz/.test(t)) score = 3;

  if (isNaN(score)) {
    await sendWhatsAppMessage(phone, "Kripya niche se 0-3 wala option chunein. Bahar nikalne ke liye *menu* likhein.");
    await sendPhqQuestion(phone, step);
    return;
  }

  const newScores = [...scores];
  newScores[step] = score; // index by question → duplicate webhooks for the same Q are idempotent

  if (step + 1 >= PHQ9.length) {
    const total = newScores.reduce((a, b) => a + (b || 0), 0);
    const r = interpretPHQ9(total);
    const selfHarm = (newScores[8] ?? 0) > 0;
    let msg = `🧠 *Result*\n\nScore: *${total}/27* — ${r.level}\n\n${r.action}`;
    if (selfHarm) msg += `\n\n💚 Aapne khud ko nuksan ke khayal ka zikr kiya. Aap akele nahi ho, madad maujood hai.`;
    msg += `\n\n📞 *KIRAN helpline: 1800-599-0019* (24/7, free)\n\n_Yeh ek screening hai, diagnosis nahi. Kisi doctor ya counsellor se zaroor baat karein._\n\nMenu ke liye *menu* likhein.`;
    await clearSession(phone);
    await sendWhatsAppMessage(phone, msg);
  } else {
    await setSession(phone, { step: step + 1, data: { scores: newScores } });
    await sendPhqQuestion(phone, step + 1);
  }
}

// ── Govt schemes ────────────────────────────
export async function handleScheme(phone: string, details: string) {
  const prompt = `Aap ek Indian government health-scheme advisor ho. User ki details: "${details}".

Inke hisaab se 3-4 sabse relevant Indian govt health schemes batao (jaise Ayushman Bharat / PM-JAY, Janani Suraksha Yojana, state schemes). Har scheme 2 lines mein: *naam* + 1 line benefit + kaise apply/kahan jaana. Simple Hindi/Hinglish mein. Koi disclaimer ya extra baat mat jodo.`;
  const reply = await askGemini(prompt);
  await clearSession(phone);
  await sendWhatsAppMessage(phone, `🏛️ *Aapke liye schemes:*\n\n${reply}\n\nMenu ke liye *menu* likhein.`);
}

// ── Doctor finder (OpenStreetMap, free) ─────
type OverpassEl = { lat?: number; lon?: number; tags?: { name?: string; amenity?: string } };

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function doctorByLocation(phone: string, lat: number, lng: number) {
  try {
    const query = `[out:json][timeout:15];(node["amenity"~"clinic|hospital|doctors|pharmacy"](around:6000,${lat},${lng}););out body 30;`;
    const res = await fetch("https://overpass-api.de/api/interpreter", { method: "POST", body: query });
    const data: { elements?: OverpassEl[] } = await res.json();
    const items = (data.elements ?? [])
      .filter((e) => e.tags?.name && typeof e.lat === "number" && typeof e.lon === "number")
      .map((e) => ({
        name: e.tags!.name as string,
        type: e.tags!.amenity ?? "facility",
        dist: haversine(lat, lng, e.lat as number, e.lon as number),
      }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 5);

    await clearSession(phone);
    if (!items.length) {
      await sendWhatsAppMessage(phone, "Aas-paas koi registered facility nahi mili. 108 par call karke nearest govt hospital pooch sakte hain.\n\nMenu: *menu* likhein.");
      return;
    }
    const list = items
      .map((x, i) => `${i + 1}. *${x.name}* (${x.type}) — ${x.dist.toFixed(1)} km`)
      .join("\n");
    await sendWhatsAppMessage(phone, `🏥 *Nazdeeki health facilities:*\n\n${list}\n\n_OpenStreetMap data — jaane se pehle call karke confirm karein._\n\nMenu: *menu* likhein.`);
  } catch {
    await clearSession(phone);
    await sendWhatsAppMessage(phone, "Location se search nahi ho paaya. Dobara *menu* se try karein.");
  }
}
