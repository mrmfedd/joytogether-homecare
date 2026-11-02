import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminProviders } from "@/components/admin/AdminProviders";
import { requireAdminSession } from "@/lib/auth";

export default async function AdminAppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdminSession();
  if (!user) redirect("/admin/login");
  return (
    <AdminProviders>
      <AdminShell user={user}>{children}</AdminShell>
    </AdminProviders>
  );
}
