import { requireAdminSession } from "@/lib/auth";
import { canManageSettings } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminSettingsPage() {
  const user = await requireAdminSession();
  if (!user || !canManageSettings(user.role)) redirect("/admin");

  const settings = await prisma.siteSetting.findMany({ orderBy: { key: "asc" } });
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--midnight)]">Website settings</h1>
      <p className="body-muted mt-1 text-sm">Business contact defaults and notification delivery status.</p>
      <ul className="mt-6 space-y-2">
        {settings.map((s) => (
          <li key={s.id} className="rounded-xl border border-line bg-white p-4 text-sm">
            <strong>{s.key}</strong>
            <pre className="mt-2 overflow-x-auto text-xs text-muted">{JSON.stringify(s.value, null, 2)}</pre>
          </li>
        ))}
      </ul>
      <section className="mt-8">
        <h2 className="font-semibold">Recent notification jobs</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {notifications.map((n) => (
            <li key={n.id} className="rounded-xl border border-line bg-white p-3">
              {n.type} — {n.status} — attempts {n.attempts}
              {n.lastError ? ` — ${n.lastError}` : ""}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
