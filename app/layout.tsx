import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import AppShell from "@/components/AppShell";
import { LanguageProvider } from "@/components/LanguageProvider";

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
    icon: "/icon.svg",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi">
      <body>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <LanguageProvider>
          <AppShell>
            {children}
          </AppShell>
        </LanguageProvider>
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
