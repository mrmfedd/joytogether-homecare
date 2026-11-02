import { generateSecret, generateURI, verifySync } from "otplib";

export function generateMfaSecret() {
  return generateSecret();
}

export function verifyMfaCode(secret: string, code: string) {
  return verifySync({ secret, token: code });
}

export function mfaOtpAuthUrl(email: string, secret: string) {
  return generateURI({ issuer: "JoyTogether Admin", label: email, secret });
}
