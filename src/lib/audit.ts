import type { AuditAction } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export async function writeAuditLog(input: {
  userId?: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  meta?: Record<string, unknown>;
  ip?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        meta: input.meta ?? undefined,
        ip: input.ip,
      },
    });
  } catch (e) {
    console.error("audit_log_failed", e instanceof Error ? e.message : "unknown");
  }
}
