"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { CareNoteCategory, PatientAlertPriority } from "@/generated/prisma";
import { requireEmployeeSession } from "@/lib/auth";
import { requireEmployeeProfile } from "@/lib/workforce/profile";
import { createCareNoteDraft, submitCareNote } from "@/lib/patient/care-notes";
import { reportConcernFromEmployee } from "@/lib/patient/alerts";
import { createPatientThread, postMessage } from "@/lib/patient/messaging";
import { prisma } from "@/lib/prisma";

const categories = [
  "DAILY_CARE",
  "PERSONAL_CARE",
  "MEDICATION_OBSERVATION",
  "MOBILITY",
  "MEALS_HYDRATION",
  "BEHAVIOR_MOOD",
  "PATIENT_CONCERN",
  "CHANGE_IN_CONDITION",
  "TRANSPORTATION",
  "GENERAL_NOTE",
] as const satisfies readonly CareNoteCategory[];

const priorities = ["LOW", "NORMAL", "HIGH", "URGENT"] as const satisfies readonly PatientAlertPriority[];

export async function employeeSaveCareNoteAction(formData: FormData) {
  const user = await requireEmployeeSession();
  if (!user) redirect("/employee/login");
  const profile = await requireEmployeeProfile(user);
  if (!profile) redirect("/employee/login");

  const patientId = String(formData.get("patientId") || "");
  const noteId = String(formData.get("noteId") || "");
  const submit = formData.get("submit") === "1";

  const parsed = z
    .object({
      patientId: z.string().uuid(),
      visitDate: z.string().min(1),
      category: z.enum(categories),
      followUpRequired: z.enum(["yes", "no"]),
    })
    .safeParse({
      patientId,
      visitDate: String(formData.get("visitDate") || ""),
      category: String(formData.get("category") || ""),
      followUpRequired: String(formData.get("followUpRequired") || "no"),
    });

  if (!parsed.success) redirect(`/employee/patients/${patientId}?tab=notes&error=invalid`);

  const visitDate = new Date(parsed.data.visitDate);
  const visitTimeRaw = String(formData.get("visitTime") || "");
  const visitTimeMinutes = visitTimeRaw
    ? (() => {
        const [h, m] = visitTimeRaw.split(":").map(Number);
        return h * 60 + m;
      })()
    : undefined;

  let id = noteId;
  if (!id) {
    const draft = await createCareNoteDraft({
      patientId: parsed.data.patientId,
      profileId: profile.id,
      userId: user.id,
      visitDate,
      visitTimeMinutes,
      category: parsed.data.category,
      careActivities: String(formData.get("careActivities") || "") || undefined,
      observations: String(formData.get("observations") || "") || undefined,
      concerns: String(formData.get("concerns") || "") || undefined,
      actionsTaken: String(formData.get("actionsTaken") || "") || undefined,
      additionalComments: String(formData.get("additionalComments") || "") || undefined,
      followUpRequired: parsed.data.followUpRequired === "yes",
    });
    id = draft.id;
  } else {
    await prisma.patientCareNote.updateMany({
      where: { id, profileId: profile.id, status: "DRAFT" },
      data: {
        visitDate,
        visitTimeMinutes,
        category: parsed.data.category,
        careActivities: String(formData.get("careActivities") || "") || null,
        observations: String(formData.get("observations") || "") || null,
        concerns: String(formData.get("concerns") || "") || null,
        actionsTaken: String(formData.get("actionsTaken") || "") || null,
        additionalComments: String(formData.get("additionalComments") || "") || null,
        followUpRequired: parsed.data.followUpRequired === "yes",
      },
    });
  }

  if (submit) await submitCareNote(id, profile.id, user.id);

  revalidatePath(`/employee/patients/${patientId}`);
  redirect(`/employee/patients/${patientId}?tab=notes&saved=1`);
}

export async function employeeReportConcernAction(formData: FormData) {
  const user = await requireEmployeeSession();
  if (!user) redirect("/employee/login");
  const profile = await requireEmployeeProfile(user);
  if (!profile) redirect("/employee/login");

  const patientId = String(formData.get("patientId") || "");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const priority = String(formData.get("priority") || "NORMAL") as PatientAlertPriority;
  if (!patientId || !title || !description) redirect(`/employee/patients/${patientId}?tab=concern&error=invalid`);

  await reportConcernFromEmployee({
    patientId,
    profileId: profile.id,
    userId: user.id,
    title,
    description,
    priority: priorities.includes(priority) ? priority : "NORMAL",
  });

  revalidatePath(`/employee/patients/${patientId}`);
  redirect(`/employee/patients/${patientId}?tab=concern&sent=1`);
}

export async function employeeContactOfficeAction(formData: FormData) {
  const user = await requireEmployeeSession();
  if (!user) redirect("/employee/login");
  const profile = await requireEmployeeProfile(user);
  if (!profile) redirect("/employee/login");

  const patientId = String(formData.get("patientId") || "");
  const subject = String(formData.get("subject") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const urgent = formData.get("urgent") === "1";
  if (!patientId || !subject || !body) redirect(`/employee/patients/${patientId}?tab=messages&error=invalid`);

  const officeUsers = await prisma.user.findMany({
    where: { role: { in: ["SUPER_ADMIN", "ADMIN", "CARE_COORDINATOR"] }, active: true },
    select: { id: true },
  });

  await createPatientThread({
    patientId,
    subject,
    createdByUserId: user.id,
    participantUserIds: officeUsers.map((u) => u.id),
    initialBody: body,
    urgency: urgent ? "URGENT" : "NORMAL",
    actorRole: "EMPLOYEE",
    profileId: profile.id,
  });

  revalidatePath("/employee/messages");
  redirect(`/employee/patients/${patientId}?tab=messages&sent=1`);
}