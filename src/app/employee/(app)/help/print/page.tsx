import { redirect } from "next/navigation";
import { HelpMarkdown } from "@/components/help/HelpMarkdown";
import { requireEmployeeSession } from "@/lib/auth";
import { listAllPublishedArticles } from "@/lib/help/queries";

export default async function EmployeeHelpPrintPage() {
  const user = await requireEmployeeSession();
  if (!user) redirect("/employee/login");

  const articles = await listAllPublishedArticles("EMPLOYEE", "EMPLOYEE");

  return (
    <div className="min-h-screen bg-white p-8">
      <header className="mb-8 border-b pb-4">
        <h1 className="font-display text-3xl">JoyTogether — Employee Portal Manual</h1>
        <p className="text-sm text-muted">Print or Save as PDF from your browser.</p>
      </header>
      {articles.map((article, index) => (
        <section key={article.id} className={index > 0 ? "mt-12 break-before-page" : ""}>
          <h2 className="font-display text-2xl">{article.title}</h2>
          <div className="mt-4">
            <HelpMarkdown content={article.content} />
          </div>
        </section>
      ))}
    </div>
  );
}
