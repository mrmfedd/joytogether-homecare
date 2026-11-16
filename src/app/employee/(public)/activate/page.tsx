import { redirect } from "next/navigation";

export default async function EmployeeActivatePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token?.trim()) {
    redirect("/employee/accept-invite?error=missing");
  }
  redirect(`/employee/accept-invite?token=${encodeURIComponent(token.trim())}`);
}