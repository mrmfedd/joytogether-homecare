import { connection } from "next/server";
import { redirect } from "next/navigation";
import { EmployeeShell } from "@/components/employee/EmployeeShell";
import { EmployeeProviders } from "@/components/employee/EmployeeProviders";
import { requireEmployeeSession } from "@/lib/auth";
import { requireEmployeeProfile } from "@/lib/workforce/profile";
import { isTimeClockEnabled } from "@/lib/workforce/settings";

export default async function EmployeeAppLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const user = await requireEmployeeSession();
  if (!user) redirect("/employee/login");

  const profile = await requireEmployeeProfile(user);
  if (!profile) redirect("/employee/login");

  const timeClockEnabled = await isTimeClockEnabled();

  return (
    <EmployeeProviders>
      <EmployeeShell user={user} timeClockEnabled={timeClockEnabled}>
        {children}
      </EmployeeShell>
    </EmployeeProviders>
  );
}
