"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { addCareNoteAddendum, markCareNoteReviewed } from "@/lib/patient/care-notes";
import { canReviewPatientCareNotes } from "@/lib/patient/permissions";

export async function markNoteReviewedAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user || !canReviewPatientCareNotes(user.role)) redirect("/admin/patients/notes?error=unauthorized");

  const noteId = String(formData.get("noteId") || "");
  const patientId = String(formData.get("patientId") || "");
  if (!noteId) redirect("/admin/patients/notes?error=invalid");

  await markCareNoteReviewed(noteId, user.id);
  revalidatePath("/admin/patients/notes");
  revalidatePath(`/admin/patients/${patientId}`);
  redirect("/admin/patients/notes");
}

export async function addNoteAddendumAction(formData: FormData) {
  const user = await requireAdminSession();
  if (!user || !canReviewPatientCareNotes(user.role)) redirect("/admin/patients/notes?error=unauthorized");

  const noteId = String(formData.get("noteId") || "");
  const body = String(formData.get("body") || "").trim();
  if (!noteId || !body) redirect("/admin/patients/notes?error=invalid");

  await addCareNoteAddendum({ noteId, authorUserId: user.id, body });
  revalidatePath("/admin/patients/notes");
  redirect("/admin/patients/notes");
}