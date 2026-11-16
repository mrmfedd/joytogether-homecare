import { site } from "@/content/site";

/** Canonical public origin for invite links and outbound emails (no trailing slash). */
export function publicSiteBaseUrl(override?: string) {
  const raw = override?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim() || site.url;
  return raw.replace(/\/$/, "");
}