import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { savePageContentAction } from "@/app/admin/(app)/content/actions";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { requireAdminSession } from "@/lib/auth";
import { canManageContent } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { previewContentUrl } from "@/lib/content/preview";
import { PublicationStatus } from "@/generated/prisma";

export default async function EditContentPage({ params }: { params: Promise<{ key: string }> }) {
  const user = await requireAdminSession();
  if (!user || !canManageContent(user.role)) redirect("/admin");

  const { key: rawKey } = await params;
  const key = decodeURIComponent(rawKey);
  const page = await prisma.pageContent.findUnique({
    where: { key },
    include: { revisions: { orderBy: { createdAt: "desc" }, take: 10, include: { createdBy: { select: { email: true } } } } },
  });
  if (!page) notFound();

  let previewUrl: string | null = null;
  try {
    previewUrl = previewContentUrl(page.key);
  } catch {
    previewUrl = null;
  }

  const body = (page.body || {}) as Record<string, unknown>;
  const showMedia = key === "homepage.hero" || key === "services.hub" || key.startsWith("page.");

  return (
    <div className="max-w-3xl">
      <Link href="/admin/content" className="text-sm font-semibold text-[var(--royal)]">
        ← Content
      </Link>
      <h1 className="mt-2 font-display text-3xl">{page.title}</h1>
      <p className="text-sm text-muted">{page.key}</p>

      <form action={savePageContentAction} className="mt-6 space-y-4 rounded-2xl border border-line bg-white p-6">
        <input type="hidden" name="key" value={page.key} />
        <label className="block text-sm font-semibold">
          Title
          <input name="title" required defaultValue={page.title} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
        </label>
        {showMedia ? (
          <>
            <MediaPicker
              name="imageUrl"
              label="Featured / hero image"
              defaultUrl={typeof body.imageUrl === "string" ? body.imageUrl : ""}
              defaultMediaId={typeof body.imageMediaId === "string" ? body.imageMediaId : ""}
            />
            <label className="block text-sm font-semibold">
              Image alt text
              <input
                name="imageAlt"
                defaultValue={typeof body.imageAlt === "string" ? body.imageAlt : ""}
                className="mt-1 w-full rounded-xl border border-line px-3 py-2"
                placeholder="Describe the image for accessibility"
              />
            </label>
          </>
        ) : null}
        <label className="block text-sm font-semibold">
          Body (JSON)
          <textarea
            name="bodyJson"
            required
            rows={14}
            defaultValue={JSON.stringify(page.body, null, 2)}
            className="mt-1 w-full rounded-xl border border-line px-3 py-2 font-mono text-xs"
          />
        </label>
        <label className="block text-sm font-semibold">
          Status
          <select name="status" defaultValue={page.status} className="mt-1 w-full rounded-xl border border-line px-3 py-2">
            {Object.values(PublicationStatus).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn btn-purple px-5 py-2 text-sm">
          Save &amp; version
        </button>
        {previewUrl ? (
          <a href={previewUrl} target="_blank" rel="noreferrer" className="ml-3 text-sm font-bold text-[var(--royal)]">
            Preview draft →
          </a>
        ) : null}
      </form>

      <section className="mt-8">
        <h2 className="font-semibold">Revision history</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {page.revisions.map((r) => (
            <li key={r.id} className="rounded-xl border border-line bg-white p-3">
              {r.createdAt.toLocaleString()} {r.createdBy?.email ? `• ${r.createdBy.email}` : ""}
            </li>
          ))}
          {page.revisions.length === 0 ? <li className="text-muted">No prior revisions yet.</li> : null}
        </ul>
      </section>
    </div>
  );
}
