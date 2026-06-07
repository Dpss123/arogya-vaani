"use client";
import { useRouter } from "next/navigation";
import { getTriageColor, getTriageLabel } from "@/lib/utils";

type Props = {
  verdict: "rest" | "clinic" | "emergency";
  advice: string;
  symptoms?: string;
  showActions?: boolean;
};

export default function TriageCard({ verdict, advice, symptoms, showActions = true }: Props) {
  const router = useRouter();
  const color = getTriageColor(verdict);
  const label = getTriageLabel(verdict);

  return (
    <div style={{ background: `${color}08`, border: `1.5px solid ${color}30`, borderRadius: 20, padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, boxShadow: `0 0 10px ${color}` }} />
        <span style={{ fontSize: 16, fontWeight: 700, color, fontFamily: "Playfair Display,serif" }}>{label}</span>
      </div>
      {symptoms && (
        <div style={{ fontSize: 12, color: "rgba(249,246,240,0.4)", fontStyle: "italic", marginBottom: 10, fontFamily: "DM Mono,monospace" }}>
          Symptoms: &quot;{symptoms}&quot;
        </div>
      )}
      <p style={{ fontSize: 14, color: "rgba(249,246,240,0.8)", lineHeight: 1.7, marginBottom: showActions ? 16 : 0 }}>{advice}</p>
      {showActions && (
        <div style={{ display: "flex", gap: 10 }}>
          {verdict === "emergency" && (
            <a href="tel:108" style={{ flex: 1, background: "#FF4757", border: "none", borderRadius: 12, padding: "12px", textAlign: "center", color: "#fff", fontWeight: 800, textDecoration: "none", fontFamily: "DM Sans,sans-serif", fontSize: 15, boxShadow: "0 0 20px rgba(255,71,87,0.3)" }}>
              🚨 108 CALL
            </a>
          )}
          <button onClick={() => router.push("/doctors")} style={{ flex: 1, background: "rgba(249,246,240,0.06)", border: "1px solid rgba(249,246,240,0.1)", borderRadius: 12, padding: "12px", color: "rgba(249,246,240,0.7)", cursor: "pointer", fontFamily: "DM Sans,sans-serif", fontSize: 13 }}>
            🏥 Doctor Dhundho
          </button>
        </div>
      )}
    </div>
  );
}
