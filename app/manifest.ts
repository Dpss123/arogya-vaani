import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Arogya Vaani",
    short_name: "ArogyaVaani",
    description: "India's AI Healthcare OS — free health triage in Hindi via WhatsApp",
    start_url: "/",
    display: "standalone",
    background_color: "#06090f",
    theme_color: "#00E676",
    orientation: "portrait",
    lang: "hi",
    categories: ["health", "medical"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
