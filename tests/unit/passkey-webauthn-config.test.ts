import { afterEach, describe, expect, it } from "vitest";
import { getWebAuthnConfig } from "@/lib/passkeys/config";

describe("WebAuthn config", () => {
  afterEach(() => {
    delete process.env.WEBAUTHN_ORIGIN;
    delete process.env.WEBAUTHN_RP_ID;
  });

  it("uses explicit origin and rpID when set", () => {
    process.env.WEBAUTHN_ORIGIN = "https://preview-joy.example.vercel.app";
    process.env.WEBAUTHN_RP_ID = "preview-joy.example.vercel.app";
    const cfg = getWebAuthnConfig();
    expect(cfg.origin).toBe("https://preview-joy.example.vercel.app");
    expect(cfg.rpID).toBe("preview-joy.example.vercel.app");
  });
});