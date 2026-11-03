"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookOpen,
  Briefcase,
  CalendarDays,
  ClipboardList,
  FileText,
  HeartHandshake,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  MessageSquareQuote,
  Settings,
  Sparkles,
  Stethoscope,
  Timer,
  Users,
  Wallet,
} from "lucide-react";
import { signOut } from "next-auth/react";
import type { UserRole } from "@/generated/prisma";
import { canManageWorkforce } from "@/lib/workforce/permissions";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles?: readonly UserRole[];
  workforce?: boolean;
};

const nav: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/consultations", label: "Consultations", icon: HeartHandshake },
  { href: "/admin/private-duty", label: "Private Duty", icon: Wallet },
  { href: "/admin/services", label: "Services", icon: Stethoscope },
  { href: "/admin/service-areas", label: "Service areas", icon: Stethoscope },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { href: "/admin/careers", label: "Careers", icon: Briefcase },
  { href: "/admin/employees", label: "Employees", icon: Users, workforce: true },
  { href: "/admin/scheduling", label: "Scheduling", icon: CalendarDays, workforce: true },
  { href: "/admin/open-shifts", label: "Open Shifts", icon: Sparkles, workforce: true },
  { href: "/admin/time-off", label: "Time Off", icon: Timer, workforce: true },
  { href: "/admin/notices", label: "Notices", icon: Bell, workforce: true },
  { href: "/admin/timesheets", label: "Timesheets", icon: ClipboardList, workforce: true },
  { href: "/admin/workforce-reports", label: "Workforce Reports", icon: LayoutDashboard, workforce: true },
  { href: "/admin/reports", label: "Reports", icon: LayoutDashboard },
  { href: "/admin/help", label: "Help Center", icon: BookOpen },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/account", label: "Security", icon: Settings },
  { href: "/admin/users", label: "Admins", icon: Users, roles: ["SUPER_ADMIN"] },
];

export function AdminShell({
  user,
  children,
}: {
  user: { name?: string | null; email?: string | null; role: UserRole };
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--cream)] text-[var(--midnight)] lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-r border-line bg-white lg:sticky lg:top-0 lg:h-screen">
        <div className="border-b border-line px-5 py-5">
          <p className="font-display text-lg text-[var(--midnight)]">JoyTogether Admin</p>
          <p className="text-xs text-muted">{user.email}</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[var(--royal)]">
            {user.role.replace("_", " ")}
          </p>
        </div>
        <nav className="p-3" data-help-tour="admin-nav">
          {nav
            .filter((item) => {
              if (item.workforce && !canManageWorkforce(user.role)) return false;
              if (item.roles && !item.roles.includes(user.role)) return false;
              return true;
            })
            .map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mb-1 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-[var(--purple-50)] text-[var(--royal)]"
                    : "text-purple-900/80 hover:bg-[var(--cream)]"
                }`}
              >
                <item.icon className="h-4 w-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-line p-3">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-purple-900/80 hover:bg-[var(--cream)]"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="border-b border-line bg-white/90 px-4 py-4 backdrop-blur sm:px-8">
          <p className="text-sm text-muted">Business administration — not clinical records</p>
        </header>
        <main className="px-4 py-6 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
