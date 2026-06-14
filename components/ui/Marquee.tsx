"use client";

// Infinite scrolling ticker. Items are duplicated so the -50% translate loops seamlessly.
export default function Marquee({ items, accent = "#00E676" }: { items: string[]; accent?: string }) {
  const row = [...items, ...items];
  return (
    <div className="marquee-wrap" style={{ overflow: "hidden", padding: "14px 0", background: `${accent}0a`, borderTop: `1px solid ${accent}1f`, borderBottom: `1px solid ${accent}1f` }}>
      <div className="marquee-track" style={{ display: "flex", gap: 56, whiteSpace: "nowrap", width: "max-content", animation: "ticker 34s linear infinite" }}>
        {row.map((it, i) => (
          <span key={i} style={{ fontSize: 12, color: accent, letterSpacing: "0.08em", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
            {it} <span style={{ color: "rgba(255,255,255,0.18)", margin: "0 14px" }}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
