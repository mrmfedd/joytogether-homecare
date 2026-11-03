"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ChevronRight, Printer } from "lucide-react";
import type { HelpAudience } from "@/generated/prisma";

type Category = {
  slug: string;
  title: string;
  summary: string | null;
  articles: { slug: string; title: string; summary: string | null }[];
};

export function HelpCenterShell({
  audience,
  basePath,
  categories,
  children,
  showManageLink,
}: {
  audience: HelpAudience;
  basePath: string;
  categories: Category[];
  children: React.ReactNode;
  showManageLink?: boolean;
}) {
  const pathname = usePathname();
  const printHref = `${basePath}/print`;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--royal)]">
            {audience === "ADMIN" ? "Administrator manual" : "Employee portal manual"}
          </p>
          <h1 className="font-display text-3xl text-[var(--midnight)]">Help Center</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Search topics, follow step-by-step guides, and open contextual help without leaving your work.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={printHref}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-sm font-semibold hover:bg-[var(--cream)]"
          >
            <Printer className="h-4 w-4" aria-hidden />
            Printable manual
          </Link>
          {showManageLink ? (
            <Link
              href="/admin/help/manage"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--royal)] px-3 py-2 text-sm font-semibold text-white"
            >
              <BookOpen className="h-4 w-4" aria-hidden />
              Manage content
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <nav aria-label="Help topics" className="rounded-2xl border border-line bg-white p-3">
            <Link
              href={basePath}
              className={`mb-2 block rounded-xl px-3 py-2 text-sm font-semibold ${
                pathname === basePath ? "bg-[var(--purple-50)] text-[var(--royal)]" : "hover:bg-[var(--cream)]"
              }`}
            >
              Overview
            </Link>
            {categories.map((cat) => (
              <div key={cat.slug} className="mb-3">
                <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">{cat.title}</p>
                <ul>
                  {cat.articles.map((article) => {
                    const href = `${basePath}/${article.slug}`;
                    const active = pathname === href;
                    return (
                      <li key={article.slug}>
                        <Link
                          href={href}
                          className={`block rounded-lg px-3 py-1.5 text-sm ${
                            active ? "font-semibold text-[var(--royal)]" : "text-purple-900/80 hover:bg-[var(--cream)]"
                          }`}
                        >
                          {article.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

export function HelpBreadcrumbs({
  basePath,
  items,
}: {
  basePath: string;
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-sm text-muted">
      <Link href={basePath} className="font-semibold text-[var(--royal)] hover:underline">
        Help
      </Link>
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1">
          <ChevronRight className="h-3 w-3" aria-hidden />
          {item.href ? (
            <Link href={item.href} className="hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="text-[var(--midnight)]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
