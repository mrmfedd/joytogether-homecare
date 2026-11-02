"use server";

import { revalidatePath } from "next/cache";
import { requireActiveEmployeeContext } from "@/lib/workforce/profile";
import { prisma } from "@/lib/prisma";

export async function createAvailabilityAction(formData: FormData) {
  const ctx = await requireActiveEmployeeContext();
  if (!ctx) return;

  const dayRaw = String(formData.get("dayOfWeek") || "");
  const startRaw = String(formData.get("startMinutes") || "");
  const endRaw = String(formData.get("endMinutes") || "");
  const notes = String(formData.get("notes") || "").trim() || null;

  const dayOfWeek = dayRaw === "" ? null : Number(dayRaw);
  const startMinutes = startRaw === "" ? null : Number(startRaw);
  const endMinutes = endRaw === "" ? null : Number(endRaw);

  await prisma.employeeAvailability.create({
    data: {
      profileId: ctx.profile.id,
      dayOfWeek: Number.isFinite(dayOfWeek) ? dayOfWeek : null,
      startMinutes: Number.isFinite(startMinutes) ? startMinutes : null,
      endMinutes: Number.isFinite(endMinutes) ? endMinutes : null,
      notes,
    },
  });

  revalidatePath("/employee/availability");
}

export async function deleteAvailabilityAction(formData: FormData) {
  const ctx = await requireActiveEmployeeContext();
  if (!ctx) return;

  const id = String(formData.get("id") || "");
  if (!id) return;

  const row = await prisma.employeeAvailability.findUnique({ where: { id } });
  if (!row || row.profileId !== ctx.profile.id) return;

  await prisma.employeeAvailability.delete({ where: { id } });
  revalidatePath("/employee/availability");
}

export async function addUnavailableDateAction(formData: FormData) {
  const ctx = await requireActiveEmployeeContext();
  if (!ctx) return;

  const dateRaw = String(formData.get("unavailableDate") || "");
  if (!dateRaw) return;

  await prisma.employeeAvailability.create({
    data: {
      profileId: ctx.profile.id,
      unavailableDate: new Date(dateRaw),
      notes: String(formData.get("notes") || "").trim() || null,
    },
  });

  revalidatePath("/employee/availability");
}
