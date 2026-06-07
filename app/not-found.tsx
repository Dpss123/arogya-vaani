"use client";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

export default function NotFound() {
  const router = useRouter();
  return (
    <div style={{ minHeight: "100vh", background: "#06090f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
      <div style={{ marginBottom: 24 }}><Logo size={56} /></div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "#F9F6F0", fontFamily: "var(--font-display)", letterSpacing: "-0.02em", marginBottom: 10 }}>
        Page Nahi Mila
      </h1>
      <p style={{ fontSize: 14, color: "rgba(249,246,240,0.4)", marginBottom: 32, lineHeight: 1.7, maxWidth: 320 }}>
        Yeh page exist nahi karta. Ghabrao mat · ghar wapas jao.
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: "rgba(249,246,240,0.06)", border: "1px solid rgba(249,246,240,0.1)", borderRadius: 12, padding: "12px 24px", color: "rgba(249,246,240,0.6)", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14 }}>
          ← Wapas Jao
        </button>
        <button onClick={() => router.push("/chat")} style={{ background: "linear-gradient(135deg,#00E676,#00B4D8)", border: "none", borderRadius: 12, padding: "12px 24px", color: "#0A1128", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14 }}>
          Chat Pe Jao
        </button>
      </div>
    </div>
  );
}
