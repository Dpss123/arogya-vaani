import { NextRequest, NextResponse } from "next/server";
import { sendEmergencyAlert, sendWhatsAppMessage } from "@/lib/whatsapp";

const FIRST_AID = [
  "Patient ko aaram se litayein, tight kapde dheele karein.",
  "Saans check karein. Behosh ho toh karwat (side) par litayein.",
  "Chest pain ho toh patient ko hilne na dein, calm rakhein.",
  "Bleeding ho toh saaf kapde se dabakar pressure dein.",
  "Kuch khilayein-pilayein nahi jab tak ambulance na aaye.",
  "108 par call karein aur apni location batayein.",
];

export async function POST(req: NextRequest) {
  const { phone, symptoms, location, emergencyContact } = await req.json();
  if (!phone) return NextResponse.json({ error: "No phone" }, { status: 400 });

  await sendEmergencyAlert(phone, symptoms);

  // Alert the family / emergency contact too (best-effort).
  if (emergencyContact && emergencyContact !== phone) {
    const fam = `🚨 EMERGENCY ALERT\n\nAapke parivaar ke sadasya ne Arogya Vaani par emergency alert bheja hai.\nSymptoms: ${symptoms || "—"}\n${location ? `Location: https://maps.google.com/?q=${location}\n` : ""}\nTurant 108 par call karein.`;
    try { await sendWhatsAppMessage(emergencyContact, fam); } catch { /* best effort */ }
  }

  return NextResponse.json({ status: "emergency alert sent", location, firstAid: FIRST_AID });
}
