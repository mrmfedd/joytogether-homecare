"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
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

function isDesktopNav() {
  return typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;
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
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

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
      if (isDesktopNav()) return;
      if (!navRef.current?.contains(e.target as Node)) setOpenGroup(null);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-line/80 bg-white/95 backdrop-blur-md">
      <div className="site-container flex h-16 items-center gap-2 sm:h-[84px] lg:h-[92px]">
        <div className="min-w-0 flex-1 lg:flex-none">
          <Logo />
        </div>

        <nav
          ref={navRef}
          className={`absolute left-0 right-0 top-16 z-40 max-h-[min(70vh,520px)] overflow-y-auto border-b border-line bg-white p-4 shadow-lg sm:top-[84px] lg:static lg:top-auto lg:flex lg:max-h-none lg:flex-1 lg:items-center lg:justify-center lg:overflow-visible lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none ${
            mobileOpen ? "block" : "hidden lg:flex"
          }`}
          aria-label="Primary navigation"
        >
          <ul className="flex w-full flex-col gap-1 lg:flex-row lg:items-center lg:gap-0.5">
            {headerNav.map((item) => (
              <li
                key={item.type === "link" ? item.href : item.label}
                className="relative"
              >
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
            <li className="mt-2 border-t border-line pt-3 lg:hidden">
              <ButtonLink href="/contact" variant="purple" className="w-full">
                Free Consultation
              </ButtonLink>
            </li>
          </ul>
        </nav>

        <div className="flex shrink-0 items-center">
          <ButtonLink
            href="/contact"
            variant="purple"
            className="mr-1 hidden whitespace-nowrap px-4 py-2.5 text-xs font-bold lg:inline-flex lg:px-5 lg:text-[13px]"
          >
            Free Consultation
          </ButtonLink>
          <button
            type="button"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-purple-800 hover:bg-purple-50 lg:hidden"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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

  function openMenu() {
    if (isDesktopNav()) setOpenGroup(item.label);
  }

  function closeMenu() {
    if (isDesktopNav()) setOpenGroup(null);
  }

  function toggleMobile() {
    if (isDesktopNav()) return;
    setOpenGroup(expanded ? null : item.label);
  }

  return (
    <div
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={closeMenu}
    >
      <button
        type="button"
        id={`${id}-trigger`}
        aria-expanded={expanded}
        aria-controls={`${id}-panel`}
        aria-haspopup="true"
        className={`flex w-full items-center justify-between gap-1 rounded-lg px-3 py-2.5 text-left text-sm font-bold transition-colors lg:w-auto lg:rounded-full lg:py-2 lg:text-[13px] ${
          active || expanded
            ? "text-purple-700 bg-purple-50 lg:bg-purple-100/80"
            : "text-purple-900/85 hover:text-purple-600 hover:bg-purple-50/60"
        }`}
        onClick={toggleMobile}
      >
        <span>{item.label}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>

      <div
        id={`${id}-panel`}
        role="menu"
        aria-labelledby={`${id}-trigger`}
        className={`z-[100] pt-1 lg:absolute lg:left-0 lg:top-full lg:min-w-[240px] ${
          expanded ? "block" : "hidden"
        }`}
      >
        <ul
          className="space-y-0.5 rounded-xl border border-line bg-white py-2 pl-2 pr-2 shadow-xl lg:py-2"
          role="none"
        >
          {item.children.map((child) => (
            <li key={child.href} role="none">
              <Link
                href={child.href}
                role="menuitem"
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
