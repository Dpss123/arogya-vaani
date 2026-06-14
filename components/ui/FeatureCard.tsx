"use client";
import { motion, useReducedMotion } from "framer-motion";
import React, { useRef, useState } from "react";

// Service/feature tile: glass surface, cursor-tracking spotlight, hover lift +
// scale, the icon floats up separately on hover, plus optional staggered idle
// float and an animated glow border for featured tiles.
export default function FeatureCard({
  icon, title, body, tags, accent = "#00E676", onClick,
  float = false, floatDelay = 0, glow = false,
}: {
  icon: React.ReactNode;
  title: string;
  body?: string;
  tags?: string[];
  accent?: string;
  onClick?: () => void;
  float?: boolean;
  floatDelay?: number;
  glow?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [g, setG] = useState({ x: 50, y: 50, on: false });
  const reduce = useReducedMotion();

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
      className={glow ? "glow-border" : undefined}
      initial="rest"
      animate="rest"
      whileHover={reduce ? undefined : "hover"}
      variants={{ rest: { y: 0, scale: 1, borderColor: "rgba(255,255,255,0.08)" }, hover: { y: -7, scale: 1.015, borderColor: accent + "55" } }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      style={{
        position: "relative", borderRadius: 22, padding: 24,
        cursor: onClick ? "pointer" : "default",
        background: "rgba(11,19,34,0.45)",
        backdropFilter: "blur(10px) saturate(140%)",
        WebkitBackdropFilter: "blur(10px) saturate(140%)",
        border: "1px solid var(--border)", overflow: "hidden",
        animation: float && !reduce ? `floaty 6.5s ease-in-out ${floatDelay}s infinite` : undefined,
      }}
    >
      <div
        style={{
          position: "absolute", inset: 0, opacity: g.on ? 1 : 0, transition: "opacity 0.3s var(--ease)",
          pointerEvents: "none",
          background: `radial-gradient(380px circle at ${g.x}% ${g.y}%, ${accent}20, transparent 70%)`,
        }}
      />
      <motion.div
        variants={{ rest: { y: 0 }, hover: { y: -5 } }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        style={{ position: "relative", zIndex: 1, fontSize: 30, marginBottom: 14, display: "inline-block", filter: `drop-shadow(0 6px 16px ${accent}55)` }}
      >
        {icon}
      </motion.div>
      <div style={{ position: "relative", zIndex: 1, fontSize: 17, fontWeight: 700, color: "#F0F4FF", marginBottom: body ? 8 : 0, fontFamily: "var(--font-display)" }}>{title}</div>
      {body && <div style={{ position: "relative", zIndex: 1, fontSize: 13, color: "var(--text-2)", lineHeight: 1.65 }}>{body}</div>}
      {tags && tags.length > 0 && (
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
          {tags.map((t) => (
            <span key={t} style={{ fontSize: 10, padding: "3px 9px", borderRadius: 100, background: "rgba(255,255,255,0.04)", color: "var(--text-2)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)" }}>{t}</span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
