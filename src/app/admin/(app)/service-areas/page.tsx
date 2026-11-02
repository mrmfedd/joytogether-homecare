import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { linkServiceAreaAction, saveServiceAreaAction } from "@/app/admin/(app)/service-areas/actions";
import { requireAdminSession } from "@/lib/auth";
import { canManageServices } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminServiceAreasPage() {
  const user = await requireAdminSession();
  if (!user || !canManageServices(user.role)) redirect("/admin");

  const [areas, services] = await Promise.all([
    prisma.serviceArea.findMany({ orderBy: { name: "asc" }, include: { services: true } }),
    prisma.service.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <AdminPageHeader title="Service areas" description="Geographic coverage and service availability." />
      <form action={saveServiceAreaAction} className="grid max-w-xl gap-3 rounded-2xl border border-line bg-white p-5">
        <input name="name" required placeholder="Area name" className="rounded-xl border border-line px-3 py-2 text-sm" />
        <input name="slug" required placeholder="slug" pattern="[a-z0-9-]+" className="rounded-xl border border-line px-3 py-2 text-sm" />
        <textarea name="description" rows={3} placeholder="Description" className="rounded-xl border border-line px-3 py-2 text-sm" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="visible" defaultChecked /> Visible
        </label>
        <button type="submit" className="btn btn-purple w-fit px-4 py-2 text-sm">
          Add area
        </button>
      </form>

      <ul className="mt-8 space-y-6">
        {areas.map((area) => (
          <li key={area.id} className="rounded-2xl border border-line bg-white p-5">
            <form action={saveServiceAreaAction} className="grid gap-2 text-sm">
              <input type="hidden" name="id" value={area.id} />
              <input name="name" defaultValue={area.name} className="rounded-lg border border-line px-2 py-1 font-semibold" />
              <input name="slug" defaultValue={area.slug} className="rounded-lg border border-line px-2 py-1 text-xs" />
              <textarea name="description" rows={2} defaultValue={area.description || ""} className="rounded-lg border border-line px-2 py-1" />
              <label className="flex items-center gap-2">
                <input type="checkbox" name="visible" defaultChecked={area.visible} /> Visible
              </label>
              <button type="submit" className="w-fit text-xs font-bold text-[var(--royal)]">
                Save area
              </button>
            </form>
            <div className="mt-4 border-t border-line pt-4">
              <p className="text-xs font-bold uppercase text-muted">Linked services</p>
              <ul className="mt-2 space-y-1">
                {services.map((service) => {
                  const linked = area.services.some((l) => l.serviceId === service.id);
                  return (
                    <li key={service.id}>
                      <form action={linkServiceAreaAction} className="flex items-center gap-2 text-sm">
                        <input type="hidden" name="serviceId" value={service.id} />
                        <input type="hidden" name="serviceAreaId" value={area.id} />
                        <input type="hidden" name="linked" value="off" />
                        <input type="checkbox" name="linked" value="on" defaultChecked={linked} />
                        {service.name}
                        <button type="submit" className="text-xs font-bold text-[var(--royal)]">
                          Update
                        </button>
                      </form>
                    </li>
                  );
                })}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
