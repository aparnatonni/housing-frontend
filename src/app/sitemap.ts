import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/about", "/services", "/contact", "/pricing", "/faq", "/listings"];
  const now = new Date();

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" || route === "/listings" ? "daily" : "monthly",
    priority: route === "" ? 1 : route === "/listings" ? 0.9 : 0.6,
  }));
}
