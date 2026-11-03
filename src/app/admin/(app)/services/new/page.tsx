import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { canManageServices } from "@/lib/permissions";
import { PublicationStatus } from "@/generated/prisma";
import { saveServiceAction } from "../actions";

const statuses = Object.values(PublicationStatus);

export default async function NewServicePage() {
  const user = await requireAdminSession();
  if (!user || !canManageServices(user.role)) redirect("/admin");

  return (
    <div>
      <Link href="/admin/services" className="text-sm font-semibold text-[var(--royal)]">
        ← Services
      </Link>
      <h1 className="mt-2 font-display text-3xl">New service</h1>
      <form action={saveServiceAction} className="mt-6 max-w-2xl space-y-4 rounded-2xl border border-line bg-white p-6">
        <label className="block text-sm font-semibold">
          Name
          <input name="name" required className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
        </label>
        <label className="block text-sm font-semibold">
          Slug
          <input name="slug" required pattern="[a-z0-9-]+" className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
        </label>
        <label className="block text-sm font-semibold">
          Category
          <input name="category" required className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
        </label>
        <label className="block text-sm font-semibold">
          Description
          <textarea name="description" required rows={6} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
        </label>
        <label className="block text-sm font-semibold">
          Display order
          <input name="displayOrder" type="number" defaultValue={0} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
        </label>
        <label className="block text-sm font-semibold">
          Status
          <select name="status" defaultValue="DRAFT" className="mt-1 w-full rounded-xl border border-line px-3 py-2">
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="visible" defaultChecked /> Visible on website
        </label>
        <button type="submit" className="btn btn-purple px-5 py-2 text-sm">
          Create service
        </button>
      </form>
    </div>
  );
}
