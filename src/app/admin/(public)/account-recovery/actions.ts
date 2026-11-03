"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { completeAdminAccountRecovery } from "@/lib/admin/account-recovery";

export async function completeAdminAccountRecoveryAction(formData: FormData) {
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");
  if (password.length < 12 || password !== confirm) {
    redirect("/admin/account-recovery?error=password&token=" + encodeURIComponent(token));
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim();

  const result = await completeAdminAccountRecovery({ token, password, ip });
  if (!result.ok) {
    redirect("/admin/account-recovery?error=" + result.reason);
  }

  redirect("/admin/login?recovery=done");
}
