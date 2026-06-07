import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://arogyavaani.in";
  // Public, indexable pages only — protected/auth routes are excluded.
  const pages = [
    "",
    "/chat",
    "/report",
    "/xray",
    "/diagnostics",
    "/medicine",
    "/generic",
    "/asha",
    "/triage",
    "/doctors",
    "/mental-health",
    "/predictive",
    "/pregnancy",
    "/nutrition",
    "/growth",
    "/schemes",
    "/outbreak",
    "/emergency",
    "/first-aid",
    "/login",
  ];
  return pages.map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1.0 : 0.8,
  }));
}
