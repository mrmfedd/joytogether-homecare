import { authenticator } from "otplib";

authenticator.options = { window: 1 };

export function generateMfaSecret() {
  return authenticator.generateSecret();
}

export function verifyMfaCode(secret: string, code: string) {
  return authenticator.verify({ token: code, secret });
}

export function mfaOtpAuthUrl(email: string, secret: string) {
  return authenticator.keyuri(email, "JoyTogether Admin", secret);
}
