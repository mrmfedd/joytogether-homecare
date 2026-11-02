import { requireAdminSession } from "@/lib/auth";
import { canManageServices } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminServicesPage() {
  const user = await requireAdminSession();
  if (!user || !canManageServices(user.role)) redirect("/admin");

  const services = await prisma.service.findMany({ orderBy: { displayOrder: "asc" } });

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--midnight)]">Services</h1>
      <p className="body-muted mt-1 text-sm">Manage public service records (clinical copy may require approval).</p>
      <div className="mt-6 space-y-3">
        {services.map((s) => (
          <div key={s.id} className="rounded-2xl border border-line bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">{s.name}</p>
                <p className="text-xs text-muted">/{s.slug} • {s.category}</p>
              </div>
              <span className="text-xs font-bold uppercase">{s.status}</span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-muted">{s.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
