import { CONSENT_TEXT_VERSION, type ConsultationInput } from "@/lib/validation/consultation";
import { prisma } from "@/lib/prisma";
import { queueLeadNotification } from "@/lib/notifications";

export async function createLeadFromConsultation(input: ConsultationInput) {
  const consentText = "I consent to be contacted by JoyTogether Home Care about care options.";
  const idempotencyKey = input.idempotencyKey?.trim() || undefined;

  if (idempotencyKey) {
    const existing = await prisma.lead.findUnique({ where: { idempotencyKey } });
    if (existing) {
      return { lead: existing, created: false as const };
    }
  }

  const lead = await prisma.$transaction(async (tx) => {
    const created = await tx.lead.create({
      data: {
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        serviceInterest: input.careType,
        location: input.location || null,
        preferredContact: input.preferredContact || null,
        preferredTime: input.callbackTime || null,
        source: input.source || "consultation-form",
        status: "NEW",
        consentAt: new Date(),
        consentTextVersion: CONSENT_TEXT_VERSION,
        nonClinicalNotes: input.message || null,
        idempotencyKey,
      },
    });

    await tx.consentRecord.create({
      data: {
        leadId: created.id,
        text: consentText,
        version: CONSENT_TEXT_VERSION,
      },
    });

    await tx.consultation.create({
      data: {
        leadId: created.id,
        status: "REQUESTED",
      },
    });

    await tx.leadActivity.create({
      data: {
        leadId: created.id,
        type: "created",
        summary: `Lead created from ${created.source}. Service interest: ${created.serviceInterest}.`,
      },
    });

    return created;
  });

  await queueLeadNotification({
    leadId: lead.id,
    fullName: lead.fullName,
    email: lead.email,
    phone: lead.phone,
    careType: lead.serviceInterest,
    source: lead.source,
    location: lead.location || undefined,
  });

  return { lead, created: true as const };
}
