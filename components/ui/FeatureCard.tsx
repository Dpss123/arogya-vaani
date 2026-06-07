"use client";
import { motion } from "framer-motion";
import React, { useRef, useState } from "react";

// Service/feature tile: glow on hover, card lifts, and the icon FLOATS UP separately.
export default function FeatureCard({
  icon, title, body, tags, accent = "#00E676", onClick,
}: {
  icon: React.ReactNode;
  title: string;
  body?: string;
  tags?: string[];
  accent?: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [g, setG] = useState({ x: 50, y: 50, on: false });

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setG({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, on: true });
  };

  return (
    <motion.div
      ref={ref}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={() => setG((s) => ({ ...s, on: false }))}
      initial="rest"
      animate="rest"
      whileHover="hover"
      variants={{ rest: { y: 0, borderColor: "rgba(255,255,255,0.08)" }, hover: { y: -6, borderColor: accent + "55" } }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      style={{
        position: "relative", borderRadius: 22, padding: 24,
        cursor: onClick ? "pointer" : "default",
        background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute", inset: 0, opacity: g.on ? 1 : 0, transition: "opacity 0.3s",
          pointerEvents: "none",
          background: `radial-gradient(380px circle at ${g.x}% ${g.y}%, ${accent}1c, transparent 70%)`,
        }}
      />
      <motion.div
        variants={{ rest: { y: 0 }, hover: { y: -5 } }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        style={{ position: "relative", fontSize: 30, marginBottom: 14, display: "inline-block", filter: `drop-shadow(0 6px 16px ${accent}55)` }}
      >
        {icon}
      </motion.div>
      <div style={{ position: "relative", fontSize: 17, fontWeight: 700, color: "#F0F4FF", marginBottom: body ? 8 : 0, fontFamily: "var(--font-display)" }}>{title}</div>
      {body && <div style={{ position: "relative", fontSize: 13, color: "var(--text-2)", lineHeight: 1.65 }}>{body}</div>}
      {tags && tags.length > 0 && (
        <div style={{ position: "relative", display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
          {tags.map((t) => (
            <span key={t} style={{ fontSize: 10, padding: "3px 9px", borderRadius: 100, background: "rgba(255,255,255,0.04)", color: "var(--text-2)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)" }}>{t}</span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
