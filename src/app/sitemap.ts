import type { MetadataRoute } from "next";
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
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url;
  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: "2026-10-27",
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.8,
  }));
}
