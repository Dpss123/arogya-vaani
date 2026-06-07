import React from "react";

export default function Badge({ children, accent = "#00E676" }: { children: React.ReactNode; accent?: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11,
      fontFamily: "var(--font-mono)", letterSpacing: "0.06em", padding: "5px 12px",
      borderRadius: 100, background: `${accent}10`, color: accent, border: `1px solid ${accent}30`,
      whiteSpace: "nowrap",
    }}>
      {children}
    </span>
  );
}
