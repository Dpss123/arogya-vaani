import { supabaseAdmin } from "./supabase";

// Per-user WhatsApp conversation state, so multi-step flows (like the PHQ-9
// screener) survive across stateless webhook invocations.
export type WaSession = {
  phone: string;
  flow: string | null;       // null = idle
  step: number;
  data: Record<string, unknown>;
};

export async function getSession(phone: string): Promise<WaSession> {
  try {
    const { data } = await supabaseAdmin
      .from("whatsapp_sessions")
      .select("flow, step, data")
      .eq("phone", phone)
      .maybeSingle();
    if (!data) return { phone, flow: null, step: 0, data: {} };
    return {
      phone,
      flow: (data.flow as string) ?? null,
      step: (data.step as number) ?? 0,
      data: (data.data as Record<string, unknown>) ?? {},
    };
  } catch {
    return { phone, flow: null, step: 0, data: {} };
  }
}

export async function setSession(
  phone: string,
  patch: { flow?: string | null; step?: number; data?: Record<string, unknown> }
): Promise<boolean> {
  try {
    const cur = await getSession(phone);
    const { error } = await supabaseAdmin.from("whatsapp_sessions").upsert(
      {
        phone,
        flow: patch.flow !== undefined ? patch.flow : cur.flow,
        step: patch.step !== undefined ? patch.step : cur.step,
        data: patch.data !== undefined ? patch.data : cur.data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "phone" }
    );
    if (error) throw error;
    return true;
  } catch (e) {
    // Table missing / DB hiccup: don't crash the webhook — stateless features still work.
    console.error("setSession failed (run lib/supabase-whatsapp-sessions.sql?):", e);
    return false;
  }
}

export async function clearSession(phone: string): Promise<void> {
  try {
    await supabaseAdmin.from("whatsapp_sessions").upsert(
      { phone, flow: null, step: 0, data: {}, updated_at: new Date().toISOString() },
      { onConflict: "phone" }
    );
  } catch (e) {
    console.error("clearSession failed:", e);
  }
}
