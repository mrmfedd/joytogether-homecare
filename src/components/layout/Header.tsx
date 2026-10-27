"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { headerNav, type NavItem } from "@/content/navigation";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function groupActive(pathname: string, item: Extract<NavItem, { type: "group" }>) {
  if (item.href && isActive(pathname, item.href)) return true;
  return item.children.some((c) => isActive(pathname, c.href));
}

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMobileOpen(false);
    setOpenGroup(null);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen && !openGroup) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setOpenGroup(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, openGroup]);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!navRef.current?.contains(e.target as Node)) setOpenGroup(null);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-white/92 backdrop-blur-md">
      <div className="site-container flex h-[72px] items-center justify-between gap-3 lg:h-[76px]">
        <Logo />

        <nav
          ref={navRef}
          className={`absolute left-0 right-0 top-[72px] max-h-[min(70vh,520px)] overflow-y-auto border-b border-line bg-white p-4 shadow-lg lg:static lg:top-auto lg:flex lg:max-h-none lg:items-center lg:gap-1 lg:overflow-visible lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none ${
            mobileOpen ? "block" : "hidden lg:flex"
          }`}
          aria-label="Primary navigation"
        >
          <ul className="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-0.5">
            {headerNav.map((item) => (
              <li key={item.type === "link" ? item.href : item.label} className="relative">
                {item.type === "link" ? (
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={navLinkClass(isActive(pathname, item.href))}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <NavGroup
                    item={item}
                    pathname={pathname}
                    openGroup={openGroup}
                    setOpenGroup={setOpenGroup}
                    onNavigate={() => {
                      setMobileOpen(false);
                      setOpenGroup(null);
                    }}
                  />
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <ButtonLink
            href="/contact"
            variant="purple"
            className="hidden whitespace-nowrap px-4 py-2.5 text-xs font-bold md:inline-flex lg:px-5 lg:text-[13px]"
          >
            Free Consultation
          </ButtonLink>
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-2xl text-purple-800 lg:hidden"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? "×" : "☰"}
          </button>
        </div>
      </div>
    </header>
  );
}

function navLinkClass(active: boolean) {
  return `block rounded-lg px-3 py-2.5 text-sm font-bold transition-colors lg:rounded-full lg:py-2 lg:text-[13px] ${
    active ? "text-purple-700 bg-purple-50 lg:bg-purple-100/80" : "text-purple-900/85 hover:text-purple-600 hover:bg-purple-50/60"
  }`;
}

function NavGroup({
  item,
  pathname,
  openGroup,
  setOpenGroup,
  onNavigate,
}: {
  item: Extract<NavItem, { type: "group" }>;
  pathname: string;
  openGroup: string | null;
  setOpenGroup: (v: string | null) => void;
  onNavigate: () => void;
}) {
  const id = useId();
  const expanded = openGroup === item.label;
  const active = groupActive(pathname, item);

  return (
    <div>
      <button
        type="button"
        id={`${id}-trigger`}
        aria-expanded={expanded}
        aria-controls={`${id}-panel`}
        className={`flex w-full items-center justify-between gap-1 rounded-lg px-3 py-2.5 text-left text-sm font-bold transition-colors lg:w-auto lg:rounded-full lg:py-2 lg:text-[13px] ${
          active
            ? "text-purple-700 bg-purple-50 lg:bg-purple-100/80"
            : "text-purple-900/85 hover:text-purple-600 hover:bg-purple-50/60"
        }`}
        onClick={() => setOpenGroup(expanded ? null : item.label)}
      >
        <span>{item.label}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-trigger`}
        className={`lg:absolute lg:left-0 lg:top-[calc(100%+6px)] lg:min-w-[220px] ${
          expanded ? "block" : "hidden"
        }`}
      >
        <ul
          className="mt-1 space-y-0.5 rounded-xl border border-line bg-white py-2 pl-2 pr-2 shadow-lg lg:mt-0 lg:py-2"
        >
          {item.children.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                onClick={onNavigate}
                className={`block rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive(pathname, child.href)
                    ? "bg-purple-50 text-purple-700"
                    : "text-purple-900/90 hover:bg-purple-50 hover:text-purple-700"
                }`}
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
