import type { MetadataRoute } from "next";
import { serviceLandings } from "@/content/careServices";
import { site } from "@/content/site";

const routes = [
  "",
  "/about",
  "/our-mission",
  "/services",
  "/home-care-and-companion-care",
  "/palmetto-fl",
  "/training",
  "/fingerprinting",
  "/apply",
  "/payment-information",
  "/contact",
  "/privacy",
  "/terms",
  ...serviceLandings.map((s) => `/services/${s.slug}`),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url;
  const now = new Date().toISOString().slice(0, 10);
  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority:
      path === ""
        ? 1
        : path.startsWith("/services/private-duty")
          ? 0.95
          : path.startsWith("/services")
            ? 0.9
            : 0.7,
  }));
}
