/** Restrict post-login redirects to the portal the user signed into. */
export function safePortalCallbackUrl(callbackUrl: string | null | undefined, portal: "admin" | "employee") {
  const fallback = portal === "admin" ? "/admin" : "/employee";
  const raw = (callbackUrl || "").trim();
  if (!raw) return fallback;

  try {
    const pathname = raw.startsWith("http") ? new URL(raw).pathname : raw.split("?")[0];
    if (portal === "employee" && pathname.startsWith("/employee")) return raw;
    if (portal === "admin" && pathname.startsWith("/admin")) return raw;
  } catch {
    return fallback;
  }
  return fallback;
}