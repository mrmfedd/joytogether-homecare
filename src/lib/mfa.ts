import { generateSecret, generateURI, verifySync } from "otplib";

export function generateMfaSecret() {
  return generateSecret();
}

export function verifyMfaCode(secret: string, code: string) {
  const result = verifySync({ secret, token: code });
  return typeof result === "boolean" ? result : Boolean(result.valid);
}

export function mfaOtpAuthUrl(email: string, secret: string) {
  return generateURI({ issuer: "JoyTogether Admin", label: email, secret });
}
