"use client";
import { getRiskColor, formatDateHindi } from "@/lib/utils";

type Props = {
  fileType: string;
  summary: string;
  riskLevel: "normal" | "borderline" | "urgent";
  uploadedAt?: string;
  fileName?: string;
};

export default function ReportCard({ fileType, summary, riskLevel, uploadedAt, fileName }: Props) {
  const color = getRiskColor(riskLevel);
  const icons: Record<string, string> = {
    blood_test: "🩸", xray: "🫁", urine: "💛", prescription: "💊", other: "📋",
  };

  return (
    <div style={{ background: "rgba(249,246,240,0.03)", border: `1px solid ${color}25`, borderRadius: 18, padding: 20, transition: "all 0.2s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}10`, border: `1px solid ${color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
          {icons[fileType] || "📋"}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#F9F6F0", marginBottom: 2 }}>
            {fileName || fileType.replace("_", " ").toUpperCase()}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />
            <span style={{ fontSize: 11, color, fontFamily: "DM Mono,monospace", letterSpacing: "0.06em", textTransform: "uppercase" }}>{riskLevel}</span>
            {uploadedAt && <span style={{ fontSize: 11, color: "rgba(249,246,240,0.3)", fontFamily: "DM Mono,monospace" }}>· {formatDateHindi(uploadedAt)}</span>}
          </div>
        </div>
      </div>
      <div style={{ fontSize: 13, color: "rgba(249,246,240,0.65)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
        {summary.slice(0, 200)}{summary.length > 200 ? "..." : ""}
      </div>
    </div>
  );
}
