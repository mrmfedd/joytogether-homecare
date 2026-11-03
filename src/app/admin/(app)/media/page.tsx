import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaLibraryClient } from "@/components/admin/MediaLibraryClient";
import { requireAdminSession } from "@/lib/auth";
import { canManageContent } from "@/lib/permissions";
import { redirect } from "next/navigation";

export default async function AdminMediaPage() {
  const user = await requireAdminSession();
  if (!user || !canManageContent(user.role)) redirect("/admin");

  return (
    <div>
      <AdminPageHeader
        title="Media library"
        description="Secure private Blob uploads for website imagery. Select assets when editing hero, services, testimonials, and page content. The JoyTogether logo remains the static brand mark at /assets/logo.png."
      />
      <MediaLibraryClient />
    </div>
  );
}
