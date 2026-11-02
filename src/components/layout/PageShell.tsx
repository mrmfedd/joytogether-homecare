import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyConsultButton } from "@/components/layout/StickyConsultButton";

export function PageShell({ children }: { children: React.ReactNode }) {
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
