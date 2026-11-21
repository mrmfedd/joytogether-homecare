import { publicSiteBaseUrl } from "@/lib/site-url";

export function getWebAuthnConfig() {
  const origin =
    process.env.WEBAUTHN_ORIGIN?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    publicSiteBaseUrl();
  const url = new URL(origin);
  const rpID = process.env.WEBAUTHN_RP_ID?.trim() || url.hostname;
  const rpName = process.env.WEBAUTHN_RP_NAME?.trim() || "JoyTogether Home Care";
  return { origin, rpID, rpName };
}