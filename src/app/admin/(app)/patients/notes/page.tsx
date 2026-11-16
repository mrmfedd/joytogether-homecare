import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { canReviewPatientCareNotes, canViewPatientDirectory } from "@/lib/patient/permissions";
import { prisma } from "@/lib/prisma";
import { decryptCareNoteFields } from "@/lib/patient/care-notes";
import { careNoteCategoryLabels } from "@/lib/patient/labels";
import { HelpPageHeader } from "@/components/help/HelpPageHeader";
import { markNoteReviewedAction } from "../note-actions";

export default async function AdminPatientNotesPage({
  searchParams,
}: {
  searchParams: Promise<{ patientId?: string }>;
}) {
  const user = await requireAdminSession();
  if (!user || !canViewPatientDirectory(user.role)) redirect("/admin");
  const params = await searchParams;

  const notes = await prisma.patientCareNote.findMany({
    where: {
      patientId: params.patientId,
      status: "SUBMITTED",
    },
    include: {
      patient: { select: { id: true, firstName: true, lastName: true, publicId: true } },
      author: { include: { user: { select: { name: true } } } },
    },
    orderBy: { submittedAt: "desc" },
    take: 100,
  });

  const canReview = canReviewPatientCareNotes(user.role);

  return (
    <div>
      <HelpPageHeader
        audience="ADMIN"
        role={user.role}
        pathname="/admin/patients/notes"
        title="Patient Care Notes"
        description="Review submitted documentation. Submitted notes are locked; corrections use dated addenda."
      />
      <div className="mt-4 space-y-3">
        {notes.map((n) => {
          const body = decryptCareNoteFields(n);
          return (
            <article key={n.id} className="rounded-2xl border border-line bg-white p-5">
                <p className="font-semibold">
                  <Link href={`/admin/patients/${n.patient.id}`} className="text-[var(--royal)]">
                    {n.patient.lastName}, {n.patient.firstName}
                  </Link>{" "}
                  · {careNoteCategoryLabels[n.category]}
                </p>
                <p className="text-sm text-muted">
                  {n.visitDate.toLocaleDateString()} · {n.author.user.name} · {n.reviewedAt ? "Reviewed" : "Awaiting review"}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm">{body.observations}</p>
                {canReview && !n.reviewedAt ? (
                  <form action={markNoteReviewedAction} className="mt-3">
                    <input type="hidden" name="noteId" value={n.id} />
                    <input type="hidden" name="patientId" value={n.patientId} />
                    <button type="submit" className="btn btn-purple px-4 py-2 text-sm">
                      Mark reviewed
                    </button>
                  </form>
                ) : null}
            </article>
          );
        })}
        {notes.length === 0 ? <p className="text-sm text-muted">No submitted notes yet.</p> : null}
      </div>
    </div>
  );
}