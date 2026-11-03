import Link from "next/link";
import { redirect } from "next/navigation";
import { HelpCenterShell } from "@/components/help/HelpCenterShell";
import { HelpSearchBar } from "@/components/help/HelpSearchBar";
import { HelpTourLauncher } from "@/components/help/HelpTourLauncher";
import { requireAdminSession } from "@/lib/auth";
import { canManageHelpContent } from "@/lib/help/access";
import { ADMIN_WALKTHROUGHS } from "@/lib/help/walkthroughs";
import { listHelpCategories, listHelpFaqs } from "@/lib/help/queries";
import { searchAdminHelpAction } from "@/lib/help/search-actions";

export default async function AdminHelpHomePage() {
  const user = await requireAdminSession();
  if (!user) redirect("/admin/login");

  const [categories, faqs] = await Promise.all([listHelpCategories("ADMIN", user.role), listHelpFaqs("ADMIN")]);

  return (
    <div id="top">
      <HelpCenterShell
        audience="ADMIN"
        basePath="/admin/help"
        categories={categories}
        showManageLink={canManageHelpContent(user.role)}
      >
        <HelpSearchBar basePath="/admin/help" onSearch={searchAdminHelpAction} />

        <section className="mt-8">
          <h2 className="font-display text-xl text-[var(--midnight)]">Quick-start guides</h2>
          <p className="mt-1 text-sm text-muted">Interactive tours you can skip, restart, or revisit anytime.</p>
          <HelpTourLauncher tours={ADMIN_WALKTHROUGHS} autoStartId="admin-first-login" />
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          {categories.map((cat) => (
            <div key={cat.id} className="rounded-2xl border border-line bg-white p-5 shadow-sm">
              <h2 className="font-display text-lg text-[var(--midnight)]">{cat.title}</h2>
              {cat.summary ? <p className="mt-1 text-sm text-muted">{cat.summary}</p> : null}
              <ul className="mt-3 space-y-2 text-sm">
                {cat.articles.slice(0, 4).map((a) => (
                  <li key={a.id}>
                    <Link href={`/admin/help/${a.slug}`} className="font-semibold text-[var(--royal)] hover:underline">
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ul>
              {cat.articles.length > 4 ? (
                <p className="mt-2 text-xs text-muted">+ {cat.articles.length - 4} more in sidebar</p>
              ) : null}
            </div>
          ))}
        </section>

        <section className="mt-10 rounded-2xl border border-line bg-white p-6">
          <h2 className="font-display text-xl">Frequently asked questions</h2>
          <dl className="mt-4 space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id}>
                <dt className="font-semibold text-[var(--midnight)]">{faq.question}</dt>
                <dd className="mt-1 text-sm text-muted whitespace-pre-wrap">{faq.answer}</dd>
              </div>
            ))}
            {faqs.length === 0 ? <p className="text-sm text-muted">FAQ entries will appear after help content is seeded.</p> : null}
          </dl>
        </section>
      </HelpCenterShell>
    </div>
  );
}
