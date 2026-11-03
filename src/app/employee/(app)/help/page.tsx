import Link from "next/link";
import { redirect } from "next/navigation";
import { HelpCenterShell } from "@/components/help/HelpCenterShell";
import { HelpSearchBar } from "@/components/help/HelpSearchBar";
import { HelpTourLauncher } from "@/components/help/HelpTourLauncher";
import { requireEmployeeSession } from "@/lib/auth";
import { EMPLOYEE_WALKTHROUGHS } from "@/lib/help/walkthroughs";
import { listHelpCategories, listHelpFaqs } from "@/lib/help/queries";
import { searchEmployeeHelpAction } from "@/lib/help/search-actions";

export default async function EmployeeHelpHomePage() {
  const user = await requireEmployeeSession();
  if (!user) redirect("/employee/login");

  const [categories, faqs] = await Promise.all([listHelpCategories("EMPLOYEE", "EMPLOYEE"), listHelpFaqs("EMPLOYEE")]);

  return (
    <div id="top">
      <HelpCenterShell audience="EMPLOYEE" basePath="/employee/help" categories={categories}>
        <HelpSearchBar basePath="/employee/help" onSearch={searchEmployeeHelpAction} />

        <section className="mt-8">
          <h2 className="font-display text-xl">Quick-start guides</h2>
          <HelpTourLauncher tours={EMPLOYEE_WALKTHROUGHS} autoStartId="employee-first-login" />
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          {categories.map((cat) => (
            <div key={cat.id} className="rounded-2xl border border-line bg-white p-5">
              <h2 className="font-display text-lg">{cat.title}</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {cat.articles.slice(0, 5).map((a) => (
                  <li key={a.id}>
                    <Link href={`/employee/help/${a.slug}`} className="font-semibold text-[var(--royal)]">
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="mt-10 rounded-2xl border border-line bg-white p-6">
          <h2 className="font-display text-xl">FAQ</h2>
          <dl className="mt-4 space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id}>
                <dt className="font-semibold">{faq.question}</dt>
                <dd className="mt-1 text-sm text-muted whitespace-pre-wrap">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      </HelpCenterShell>
    </div>
  );
}
