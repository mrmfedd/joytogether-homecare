import { describe, expect, it, vi } from "vitest";
import {
  canAccessHelpAudience,
  canManageHelpContent,
  canViewHelpArticle,
} from "@/lib/help/access";
import { resolveContextSlug, ADMIN_CONTEXT_FALLBACK, EMPLOYEE_CONTEXT_FALLBACK } from "@/lib/help/context-routes";
import { scoreMatch } from "@/lib/help/search-scoring";
import { helpSeedCategories, helpSeedFaqs } from "@/content/help/seed-data";
import { dismissWalkthrough, walkthroughStorageKey, walkthroughDismissed } from "@/lib/help/walkthroughs";

describe("help center access", () => {
  it("allows admin roles to read admin help", () => {
    expect(canAccessHelpAudience("ADMIN", "ADMIN")).toBe(true);
    expect(canAccessHelpAudience("EMPLOYEE", "ADMIN")).toBe(false);
  });

  it("restricts employee help to employee role", () => {
    expect(canAccessHelpAudience("EMPLOYEE", "EMPLOYEE")).toBe(true);
    expect(canAccessHelpAudience("ADMIN", "EMPLOYEE")).toBe(false);
  });

  it("limits CMS to SUPER_ADMIN", () => {
    expect(canManageHelpContent("SUPER_ADMIN")).toBe(true);
    expect(canManageHelpContent("ADMIN")).toBe(false);
  });

  it("respects allowedRoles on articles", () => {
    const article = {
      published: true,
      allowedRoles: ["SUPER_ADMIN"] as const,
      category: { audience: "ADMIN" as const },
    };
    expect(canViewHelpArticle("SUPER_ADMIN", { ...article, allowedRoles: ["SUPER_ADMIN"] })).toBe(true);
    expect(canViewHelpArticle("VIEWER", { ...article, allowedRoles: ["SUPER_ADMIN"] })).toBe(false);
  });
});

describe("help search scoring", () => {
  it("ranks title matches higher", () => {
    const a = scoreMatch("scheduling", ["Employee Scheduling", null]);
    const b = scoreMatch("scheduling", ["Reports", "schedule overview in body"]);
    expect(a).toBeGreaterThan(0);
    expect(a).toBeGreaterThanOrEqual(b);
  });
});

describe("context route resolution", () => {
  it("maps admin scheduling path", () => {
    expect(resolveContextSlug("/admin/scheduling", ADMIN_CONTEXT_FALLBACK)).toBe("employee-scheduling");
  });

  it("maps employee schedule path", () => {
    expect(resolveContextSlug("/employee/schedule", EMPLOYEE_CONTEXT_FALLBACK)).toBe(
      "viewing-daily-and-weekly-schedules",
    );
  });
});

describe("seed catalog", () => {
  it("includes admin and employee articles", () => {
    const admin = helpSeedCategories.filter((c) => c.audience === "ADMIN");
    const employee = helpSeedCategories.filter((c) => c.audience === "EMPLOYEE");
    const adminArticles = admin.flatMap((c) => c.articles);
    const employeeArticles = employee.flatMap((c) => c.articles);
    expect(adminArticles.length).toBeGreaterThanOrEqual(25);
    expect(employeeArticles.length).toBeGreaterThanOrEqual(26);
  });

  it("includes FAQs for both audiences", () => {
    expect(helpSeedFaqs.filter((f) => f.audience === "ADMIN").length).toBeGreaterThanOrEqual(10);
    expect(helpSeedFaqs.filter((f) => f.audience === "EMPLOYEE").length).toBeGreaterThanOrEqual(10);
  });
});

describe("walkthrough dismissal", () => {
  it("uses stable storage keys", () => {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    });
    vi.stubGlobal("window", { localStorage: globalThis.localStorage });

    expect(walkthroughStorageKey("admin-first-login")).toContain("joytogether_help_tour");
    expect(walkthroughDismissed("never-started-id-xyz-unique")).toBe(false);
    dismissWalkthrough("test-tour");
    expect(walkthroughDismissed("test-tour")).toBe(true);
  });
});
