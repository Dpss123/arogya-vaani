"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  useEffect(() => { console.error("App error:", error); }, [error]);

  return (
    <div style={{ minHeight: "100vh", background: "#06090f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
      <div style={{ fontSize: 56, marginBottom: 20 }}>⚠️</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#F9F6F0", fontFamily: "var(--font-display)", letterSpacing: "-0.02em", marginBottom: 10 }}>Kuch Galat Ho Gaya</h2>
      <p style={{ fontSize: 14, color: "rgba(249,246,240,0.4)", marginBottom: 8, lineHeight: 1.7, maxWidth: 340 }}>
        Ek technical problem aayi hai. Please dobara try karein.
      </p>
      {error.digest && (
        <p style={{ fontSize: 11, color: "rgba(249,246,240,0.2)", fontFamily: "var(--font-mono)", marginBottom: 28 }}>Error: {error.digest}</p>
      )}
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={reset} style={{ background: "linear-gradient(135deg,#00E676,#00B4D8)", border: "none", borderRadius: 12, padding: "13px 24px", color: "#0A1128", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14 }}>
          🔄 Dobara Try Karein
        </button>
        <button onClick={() => router.push("/chat")} style={{ background: "rgba(249,246,240,0.06)", border: "1px solid rgba(249,246,240,0.1)", borderRadius: 12, padding: "13px 24px", color: "rgba(249,246,240,0.6)", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14 }}>
          🏠 Home Jao
        </button>
      </div>
    </div>
  );
}
