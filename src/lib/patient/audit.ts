import type { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

/** PHI-scoped audit trail (separate from general AuditLog). Do not store clinical narrative in meta. */
export async function writePatientAuditEvent(input: {
  patientId?: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  meta?: Prisma.InputJsonValue;
  ip?: string;
}) {
  try {
    await prisma.patientAuditEvent.create({
      data: {
        patientId: input.patientId,
        userId: input.userId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        meta: input.meta ?? undefined,
        ip: input.ip,
      },
    });
  } catch (e) {
    console.error("patient_audit_failed", e instanceof Error ? e.message : "unknown");
  }
}