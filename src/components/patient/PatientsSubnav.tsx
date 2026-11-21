"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const links = [
  { href: "/admin/patients", label: "All Patients" },
  { href: "/admin/patients/new", label: "Add Patient" },
  { href: "/admin/patients/active", label: "Active" },
  { href: "/admin/patients/inactive", label: "Inactive" },
  { href: "/admin/patients/assignments", label: "Assignments" },
  { href: "/admin/patients/notes", label: "Care Notes" },
  { href: "/admin/patients/alerts", label: "Alerts" },
] as const;

export function PatientsSubnav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <nav
      aria-label="Patient management"
      className="mt-4 flex gap-2 overflow-x-auto pb-1 print:hidden"
    >
      {links.map((link) => {
        const active =
          pathname === link.href ||
          (link.href !== "/admin/patients" && pathname.startsWith(link.href)) ||
          (link.href === "/admin/patients" &&
            pathname.startsWith("/admin/patients") &&
            !links.some((l) => l.href !== "/admin/patients" && pathname.startsWith(l.href)));
        return (
          <Link
            key={link.href}
            href={link.href === "/admin/patients" && searchParams.get("q") ? `${link.href}?q=${searchParams.get("q")}` : link.href}
            className={`shrink-0 rounded-xl px-3 py-2 text-sm font-semibold ${
              active
                ? "bg-[var(--purple-50)] text-[var(--royal)]"
                : "border border-line bg-white text-purple-900/80 hover:bg-[var(--cream)]"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}