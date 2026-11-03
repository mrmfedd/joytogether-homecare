import { z } from "zod";

export const CONSENT_TEXT_VERSION = "2026-03-consult-v1";

export const consultationSchema = z.object({
  source: z.string().max(80).optional(),
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(40),
  email: z.string().trim().email().max(160),
  careType: z.string().trim().min(1).max(120),
  preferredContact: z.string().max(40).optional(),
  location: z.string().max(120).optional(),
  callbackTime: z.string().max(120).optional(),
  whoNeedsCare: z.string().max(80).optional(),
  timing: z.string().max(80).optional(),
  consent: z.literal(true),
  message: z.string().max(2000).optional(),
  website: z.string().max(0).optional(),
  idempotencyKey: z.string().max(120).optional(),
});

export type ConsultationInput = z.infer<typeof consultationSchema>;

export const jobApplicationSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().max(40).optional(),
  position: z.string().trim().min(1).max(120),
  message: z.string().max(4000).optional(),
  jobPostingId: z.string().uuid().optional(),
  website: z.string().max(0).optional(),
});
