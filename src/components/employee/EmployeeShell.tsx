"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookOpen,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Palmtree,
  Shield,
  Sparkles,
  Timer,
} from "lucide-react";
import { signOut } from "next-auth/react";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  show?: boolean;
};

export function EmployeeShell({
  user,
  timeClockEnabled,
  children,
}: {
  user: { name?: string | null; email?: string | null };
  timeClockEnabled: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const nav: NavItem[] = [
    { href: "/employee", label: "Dashboard", icon: LayoutDashboard },
    { href: "/employee/schedule", label: "Schedule", icon: CalendarDays },
    { href: "/employee/open-shifts", label: "Open Shifts", icon: Sparkles },
    { href: "/employee/availability", label: "Availability", icon: CalendarDays },
    { href: "/employee/time-off", label: "Time Off", icon: Palmtree },
    { href: "/employee/notices", label: "Notices", icon: Bell },
    { href: "/employee/help", label: "Help", icon: BookOpen },
    { href: "/employee/time-clock", label: "Time Clock", icon: Timer, show: timeClockEnabled },
    { href: "/employee/account", label: "Profile", icon: Shield },
  ].filter((item) => item.show !== false);

  const linkClass = (href: string) => {
    const active = pathname === href || (href !== "/employee" && pathname.startsWith(`${href}/`));
    return active
      ? "bg-[var(--purple-50)] text-[var(--royal)]"
      : "text-purple-900/80 hover:bg-[var(--cream)]";
  };

  return (
    <div className="min-h-screen bg-[var(--cream)] text-[var(--midnight)] pb-20 lg:pb-0 lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="hidden border-r border-line bg-white lg:block lg:sticky lg:top-0 lg:h-screen">
        <div className="border-b border-line px-5 py-5">
          <p className="font-display text-lg text-[var(--royal)]">JoyTogether</p>
          <p className="text-xs text-muted">Employee portal</p>
          <p className="mt-1 text-xs text-muted">{user.email}</p>
        </div>
        <nav className="p-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-1 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${linkClass(item.href)}`}
            >
              <item.icon className="h-4 w-4" aria-hidden />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-line p-3">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/employee/login" })}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-purple-900/80 hover:bg-[var(--cream)]"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="border-b border-line bg-white/90 px-4 py-4 backdrop-blur sm:px-6">
          <p className="text-sm text-muted">
            {user.name || "Team member"} — scheduling & workplace notices (no patient records)
          </p>
        </header>
        <main className="px-4 py-6 sm:px-6">{children}</main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur lg:hidden"
        aria-label="Employee navigation"
      >
        <ul className="grid grid-cols-4 gap-0">
          {nav.slice(0, 4).map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-2 py-2.5 text-[10px] font-bold uppercase tracking-wide ${linkClass(item.href)}`}
              >
                <item.icon className="h-5 w-5" aria-hidden />
                <span className="truncate">{item.label.split(" ")[0]}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex border-t border-line">
          {nav.slice(4).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-bold uppercase ${linkClass(item.href)}`}
            >
              <item.icon className="h-4 w-4" aria-hidden />
              {item.label.split(" ")[0]}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
