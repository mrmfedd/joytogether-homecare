import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { saveServiceAction } from "@/app/admin/(app)/services/actions";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { requireAdminSession } from "@/lib/auth";
import { canManageServices } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { PublicationStatus } from "@/generated/prisma";

const statuses = Object.values(PublicationStatus);

function ServiceForm({ service }: { service?: Awaited<ReturnType<typeof prisma.service.findUnique>> }) {
  return (
    <form action={saveServiceAction} className="mt-6 max-w-2xl space-y-4 rounded-2xl border border-line bg-white p-6">
      {service ? <input type="hidden" name="id" value={service.id} /> : null}
      <label className="block text-sm font-semibold">
        Name
        <input name="name" required defaultValue={service?.name} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
      </label>
      <label className="block text-sm font-semibold">
        Slug
        <input name="slug" required pattern="[a-z0-9-]+" defaultValue={service?.slug} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
      </label>
      <label className="block text-sm font-semibold">
        Category
        <input name="category" required defaultValue={service?.category} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
      </label>
      <label className="block text-sm font-semibold">
        Description
        <textarea name="description" required rows={6} defaultValue={service?.description} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold">
          Display order
          <input name="displayOrder" type="number" defaultValue={service?.displayOrder ?? 0} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
        </label>
        <label className="block text-sm font-semibold">
          Status
          <select name="status" defaultValue={service?.status || "DRAFT"} className="mt-1 w-full rounded-xl border border-line px-3 py-2">
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>
      <MediaPicker name="featuredImage" label="Featured image" defaultUrl={service?.featuredImage || ""} />
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" name="visible" defaultChecked={service?.visible ?? true} /> Visible on website
      </label>
      <label className="block text-sm font-semibold">
        SEO title
        <input name="seoTitle" defaultValue={service?.seoTitle || ""} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
      </label>
      <label className="block text-sm font-semibold">
        SEO description
        <textarea name="seoDescription" rows={2} defaultValue={service?.seoDescription || ""} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
      </label>
      <button type="submit" className="btn btn-purple px-5 py-2 text-sm">
        Save service
      </button>
    </form>
  );
}

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdminSession();
  if (!user || !canManageServices(user.role)) redirect("/admin");
  const { id } = await params;
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) notFound();

  return (
    <div>
      <Link href="/admin/services" className="text-sm font-semibold text-[var(--royal)]">
        ← Services
      </Link>
      <h1 className="mt-2 font-display text-3xl">Edit service</h1>
      <ServiceForm service={service} />
    </div>
  );
}
