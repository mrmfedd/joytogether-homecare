"use client";

import { usePathname } from "next/navigation";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyConsultButton } from "@/components/layout/StickyConsultButton";

function isStaffPortalPath(pathname: string) {
  return pathname.startsWith("/admin") || pathname.startsWith("/employee");
}

export function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";

  if (isStaffPortalPath(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="relative z-0 flex min-w-0 flex-1 flex-col overflow-x-clip">{children}</main>
      <Footer />
      <StickyConsultButton />
    </>
  );
}