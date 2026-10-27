"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { navLinks } from "@/content/mockup";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-white/92 backdrop-blur-md">
      <div className="site-container flex h-[82px] items-center justify-between gap-4">
        <Logo />

        <nav
          className={`absolute left-0 right-0 top-[82px] flex flex-col gap-1 border-b border-line bg-white p-5 shadow-lg lg:static lg:flex lg:flex-row lg:items-center lg:gap-7 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none ${
            open ? "flex" : "hidden lg:flex"
          }`}
          aria-label="Primary navigation"
        >
          {navLinks.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-full px-3 py-2 text-[13px] font-bold transition-colors ${
                  active
                    ? "text-purple-700"
                    : "text-purple-900/80 hover:text-purple-600"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <ButtonLink
            href="/contact"
            variant="purple"
            className="hidden px-5 py-3 text-[13px] sm:inline-flex"
          >
            Request a Free Consultation
          </ButtonLink>
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-2xl text-purple-800 lg:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "×" : "☰"}
          </button>
        </div>
      </div>
    </header>
  );
}
