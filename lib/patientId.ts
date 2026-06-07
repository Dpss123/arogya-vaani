// Per-browser patient key for the (login-less) web demo. Uses the saved
// profile phone if present, otherwise a stable random device id — so each
// browser's reports / scans / history stay isolated instead of colliding on
// a shared "demo" record. (WhatsApp users are keyed by their real number.)
export function getPatientKey(): string {
  if (typeof window === "undefined") return "demo";
  try {
    const p = JSON.parse(localStorage.getItem("av_profile") || "{}");
    if (p && typeof p.phone === "string" && p.phone.trim()) return p.phone.trim();
  } catch { /* ignore */ }
  let id = localStorage.getItem("av_device_id");
  if (!id) {
    id = "web-" + Math.random().toString(36).slice(2, 12);
    localStorage.setItem("av_device_id", id);
  }
  return id;
}
