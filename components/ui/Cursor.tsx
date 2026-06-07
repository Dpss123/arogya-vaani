"use client";
import { useEffect, useRef } from "react";

// Desktop-only custom cursor: teal dot + trailing ring (lerp follow). Hidden on touch.
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || window.matchMedia("(hover: none)").matches) return;
    let rx = 0, ry = 0, mx = 0, my = 0, raf = 0;
    const move = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      if (dot.current) dot.current.style.transform = `translate(${mx}px, ${my}px)`;
    };
    const loop = () => {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      if (ring.current) ring.current.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", move);
    raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <div ref={dot} className="cursor-dot" style={{ position: "fixed", top: 0, left: 0, width: 7, height: 7, borderRadius: "50%", background: "#00E676", marginLeft: -3.5, marginTop: -3.5, pointerEvents: "none", zIndex: 9999 }} />
      <div ref={ring} className="cursor-ring" style={{ position: "fixed", top: 0, left: 0, width: 34, height: 34, borderRadius: "50%", border: "1px solid rgba(0,230,118,0.35)", marginLeft: -17, marginTop: -17, pointerEvents: "none", zIndex: 9999 }} />
    </>
  );
}
