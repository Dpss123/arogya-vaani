"use client";
import Logo from "@/components/Logo";

// Brand loading spinner: a green ring spinning around the static Arogya Vaani
// logo. Use for full-page / standalone loaders.
export default function BrandSpinner({ size = 60, text }: { size?: number; text?: string }) {
  const bw = Math.max(2, Math.round(size / 16));
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", inset: 0, border: `${bw}px solid rgba(0,230,118,0.15)`, borderTopColor: "#00E676", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
        <Logo size={Math.round(size * 0.34)} />
      </div>
      {text && <p style={{ fontSize: 13, color: "rgba(240,244,255,0.4)", fontFamily: "var(--font-mono)", letterSpacing: "0.07em", margin: 0 }}>{text}</p>}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
