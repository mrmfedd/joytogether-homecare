import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdminSession } from "@/lib/auth";
import { canManageServices } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { archiveServiceAction } from "./actions";

export default async function AdminServicesPage() {
  const user = await requireAdminSession();
  if (!user || !canManageServices(user.role)) redirect("/admin");

  const services = await prisma.service.findMany({ orderBy: { displayOrder: "asc" } });

  return (
    <div>
      <AdminPageHeader
        title="Services"
        description="Manage public service records. Clinical copy may require admin approval when locked."
        actions={
          <Link href="/admin/services/new" className="btn btn-purple px-4 py-2 text-sm">
            Add service
          </Link>
        }
      />
      <div className="space-y-3">
        {services.map((s) => (
          <div key={s.id} className="rounded-2xl border border-line bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{s.name}</p>
                  <StatusBadge status={s.status} />
                  {s.clinicalLocked ? (
                    <span className="text-[10px] font-bold uppercase text-amber-700">Clinical locked</span>
                  ) : null}
                </div>
                <p className="text-xs text-muted">/{s.slug} • {s.category}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/services/${s.id}`} className="text-sm font-bold text-[var(--royal)] hover:underline">
                  Edit
                </Link>
                {s.status !== "ARCHIVED" ? (
                  <form action={archiveServiceAction}>
                    <input type="hidden" name="id" value={s.id} />
                    <button type="submit" className="text-sm font-bold text-amber-800 hover:underline">
                      Archive
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-muted">{s.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
