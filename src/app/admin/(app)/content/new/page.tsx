import Link from "next/link";
import { redirect } from "next/navigation";
import { savePageContentAction } from "@/app/admin/(app)/content/actions";
import { requireAdminSession } from "@/lib/auth";
import { canManageContent } from "@/lib/permissions";
import { PublicationStatus } from "@/generated/prisma";

export default async function NewContentPage() {
  const user = await requireAdminSession();
  if (!user || !canManageContent(user.role)) redirect("/admin");

  return (
    <div className="max-w-3xl">
      <Link href="/admin/content" className="text-sm font-semibold text-[var(--royal)]">
        ← Content
      </Link>
      <h1 className="mt-2 font-display text-3xl">New page block</h1>
      <form action={savePageContentAction} className="mt-6 space-y-4 rounded-2xl border border-line bg-white p-6">
        <label className="block text-sm font-semibold">
          Key (unique)
          <input name="key" required placeholder="homepage.hero" className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
        </label>
        <label className="block text-sm font-semibold">
          Title
          <input name="title" required className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
        </label>
        <label className="block text-sm font-semibold">
          Body (JSON)
          <textarea name="bodyJson" required rows={10} defaultValue="{}" className="mt-1 w-full rounded-xl border border-line px-3 py-2 font-mono text-xs" />
        </label>
        <select name="status" defaultValue="DRAFT" className="w-full rounded-xl border border-line px-3 py-2">
          {Object.values(PublicationStatus).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-purple px-5 py-2 text-sm">
          Create
        </button>
      </form>
    </div>
  );
}
