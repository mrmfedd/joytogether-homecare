import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { retryNotificationsAction, saveSiteSettingAction } from "@/app/admin/(app)/settings/actions";
import { requireAdminSession } from "@/lib/auth";
import { canManageSettings } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminSettingsPage() {
  const user = await requireAdminSession();
  if (!user || !canManageSettings(user.role)) redirect("/admin");

  const [settings, notifications] = await Promise.all([
    prisma.siteSetting.findMany({ orderBy: { key: "asc" } }),
    prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Website settings"
        description="Business contact information and notification delivery."
        actions={
          <form action={retryNotificationsAction}>
            <button type="submit" className="btn btn-purple px-4 py-2 text-sm">
              Retry pending emails
            </button>
          </form>
        }
      />
      <ul className="space-y-4">
        {settings.map((s) => (
          <li key={s.id} className="rounded-xl border border-line bg-white p-4 text-sm">
            <form action={saveSiteSettingAction} className="grid gap-2">
              <strong>{s.key}</strong>
              <textarea
                name="valueJson"
                rows={4}
                defaultValue={JSON.stringify(s.value, null, 2)}
                className="rounded-lg border border-line px-2 py-1 font-mono text-xs"
              />
              <input type="hidden" name="key" value={s.key} />
              <button type="submit" className="w-fit text-xs font-bold text-[var(--royal)]">
                Save setting
              </button>
            </form>
          </li>
        ))}
      </ul>
      <section className="mt-8">
        <h2 className="font-semibold">Notification delivery log</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {notifications.map((n) => (
            <li key={n.id} className="rounded-xl border border-line bg-white p-3">
              <span className="font-semibold">{n.type}</span> — {n.status} — attempts {n.attempts}
              {n.sentAt ? ` • sent ${n.sentAt.toLocaleString()}` : ""}
              {n.lastError ? <span className="text-red-700"> — {n.lastError}</span> : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
