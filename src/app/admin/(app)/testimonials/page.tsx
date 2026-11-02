import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { archiveTestimonialAction, saveTestimonialAction } from "@/app/admin/(app)/testimonials/actions";
import { mediaPublicPath } from "@/lib/storage/media";
import { requireAdminSession } from "@/lib/auth";
import { canManageContent } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PublicationStatus } from "@/generated/prisma";

export default async function AdminTestimonialsPage() {
  const user = await requireAdminSession();
  if (!user || !canManageContent(user.role)) redirect("/admin");

  const testimonials = await prisma.testimonial.findMany({
    orderBy: { displayOrder: "asc" },
    include: { mediaAsset: true },
  });

  return (
    <div>
      <AdminPageHeader title="Testimonials" description="Publish only when permission is recorded." />
      <form action={saveTestimonialAction} className="grid max-w-2xl gap-3 rounded-2xl border border-line bg-white p-5">
        <textarea name="quote" required rows={3} placeholder="Quote" className="rounded-xl border border-line px-3 py-2 text-sm" />
        <input name="authorName" required placeholder="Author name" className="rounded-xl border border-line px-3 py-2 text-sm" />
        <input name="authorRole" placeholder="Author role" className="rounded-xl border border-line px-3 py-2 text-sm" />
        <MediaPicker name="mediaUrl" label="Optional portrait / photo" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="permissionRecorded" /> Permission recorded
        </label>
        <input name="permissionNote" placeholder="Permission notes" className="rounded-xl border border-line px-3 py-2 text-sm" />
        <select name="status" defaultValue="DRAFT" className="rounded-xl border border-line px-3 py-2 text-sm">
          {Object.values(PublicationStatus).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-purple w-fit px-4 py-2 text-sm">
          Add testimonial
        </button>
      </form>
      <ul className="mt-8 space-y-4">
        {testimonials.map((t) => (
          <li key={t.id} className="rounded-2xl border border-line bg-white p-5 text-sm">
            <form action={saveTestimonialAction} className="grid gap-2">
              <input type="hidden" name="id" value={t.id} />
              <textarea name="quote" rows={3} defaultValue={t.quote} className="rounded-lg border border-line px-2 py-1 italic" />
              <input name="authorName" defaultValue={t.authorName} className="rounded-lg border border-line px-2 py-1 font-semibold" />
              <input name="authorRole" defaultValue={t.authorRole || ""} className="rounded-lg border border-line px-2 py-1" />
              <MediaPicker
                name="mediaUrl"
                label="Portrait / photo"
                defaultUrl={t.mediaAssetId ? mediaPublicPath(t.mediaAssetId) : ""}
                defaultMediaId={t.mediaAssetId || ""}
              />
              <label className="flex items-center gap-2">
                <input type="checkbox" name="permissionRecorded" defaultChecked={t.permissionRecorded} /> Permission recorded
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={t.status} />
                <select name="status" defaultValue={t.status} className="rounded-lg border border-line px-2 py-1 text-xs">
                  {Object.values(PublicationStatus).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button type="submit" className="text-xs font-bold text-[var(--royal)]">
                  Save
                </button>
              </div>
            </form>
            {t.status !== "ARCHIVED" ? (
              <form action={archiveTestimonialAction} className="mt-2">
                <input type="hidden" name="id" value={t.id} />
                <button type="submit" className="text-xs font-bold text-amber-800">
                  Archive
                </button>
              </form>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
