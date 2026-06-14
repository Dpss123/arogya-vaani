"use client";
import { motion, useReducedMotion } from "framer-motion";
import React from "react";

// Scroll-into-view reveal wrapper (fade + slide-up). Static for reduced-motion.
export default function Reveal({
  children, delay = 0, y = 28, style,
}: {
  children: React.ReactNode; delay?: number; y?: number; style?: React.CSSProperties;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div style={style}>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      style={style}
    >
      {children}
    </motion.div>
  );
}
