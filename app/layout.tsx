import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import AppShell from "@/components/AppShell";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0A1128",
};

export const metadata: Metadata = {
  title: "Arogya Vaani · India's Healthcare OS",
  description: "WhatsApp-native AI health platform for rural India. Free symptom triage, report analysis, doctor connect · in Hindi.",
  keywords: "health AI India, rural healthcare, WhatsApp health, Hindi medical AI, Arogya Vaani",
  openGraph: {
    title: "Arogya Vaani",
    description: "India's first WhatsApp-native AI healthcare platform",
    type: "website",
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏥</text></svg>",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi">
      <body>
        <AppShell>
          {children}
        </AppShell>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#0d1535",
              color: "#F9F6F0",
              border: "1px solid rgba(249,246,240,0.1)",
              fontFamily: "var(--font-body)",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#00E676", secondary: "#0A1128" } },
            error: { iconTheme: { primary: "#FF4757", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
