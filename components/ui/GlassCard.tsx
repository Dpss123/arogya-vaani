"use client";
import { motion, useReducedMotion } from "framer-motion";
import React, { useRef, useState } from "react";

// Premium glass container: translucent glass surface + cursor-tracking radial
// spotlight + hover lift/scale. Optional idle float (staggered via floatDelay)
// and an animated conic glow border for featured cards.
export default function GlassCard({
  children, style, accent = "#00E676", onClick, lift = true,
  float = false, floatDelay = 0, glow = false,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  accent?: string;
  onClick?: () => void;
  lift?: boolean;
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
      onMouseMove={onMove}
      onMouseLeave={() => setG((s) => ({ ...s, on: false }))}
      onClick={onClick}
      className={glow ? "glow-border" : undefined}
      whileHover={lift && !reduce
        ? { y: -5, scale: 1.012, borderColor: accent + "55", boxShadow: `0 22px 50px rgba(0,0,0,0.42), 0 0 30px ${accent}22` }
        : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      style={{
        position: "relative",
        borderRadius: 22,
        border: "1px solid var(--border)",
        background: "rgba(11,19,34,0.45)",
        backdropFilter: "blur(10px) saturate(140%)",
        WebkitBackdropFilter: "blur(10px) saturate(140%)",
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        animation: float && !reduce ? `floaty 6s ease-in-out ${floatDelay}s infinite` : undefined,
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute", inset: 0, opacity: g.on ? 1 : 0, transition: "opacity 0.3s var(--ease)",
          pointerEvents: "none",
          background: `radial-gradient(460px circle at ${g.x}% ${g.y}%, ${accent}1a, transparent 70%)`,
        }}
      />
      <div style={{ position: "relative", zIndex: 1, height: "100%" }}>{children}</div>
    </motion.div>
  );
}
