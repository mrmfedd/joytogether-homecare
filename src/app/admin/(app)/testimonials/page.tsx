import { requireAdminSession } from "@/lib/auth";
import { canManageContent } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminTestimonialsPage() {
  const user = await requireAdminSession();
  if (!user || !canManageContent(user.role)) redirect("/admin");

  const testimonials = await prisma.testimonial.findMany({ orderBy: { displayOrder: "asc" } });

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--midnight)]">Testimonials</h1>
      <p className="body-muted mt-1 text-sm">Publish only when permission is recorded.</p>
      <ul className="mt-6 space-y-3">
        {testimonials.map((t) => (
          <li key={t.id} className="rounded-2xl border border-line bg-white p-5 text-sm">
            <p className="font-semibold">{t.authorName}</p>
            <p className="mt-2 italic">&ldquo;{t.quote}&rdquo;</p>
            <p className="mt-2 text-xs text-muted">
              {t.status} • Permission recorded: {t.permissionRecorded ? "yes" : "no"}
            </p>
          </li>
        ))}
        {testimonials.length === 0 ? <li className="text-sm text-muted">No testimonials yet.</li> : null}
      </ul>
    </div>
  );
}
