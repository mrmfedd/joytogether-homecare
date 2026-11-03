import { redirect } from "next/navigation";
import { HelpMarkdown } from "@/components/help/HelpMarkdown";
import { requireAdminSession } from "@/lib/auth";
import { listAllPublishedArticles } from "@/lib/help/queries";

export default async function AdminHelpPrintPage() {
  const user = await requireAdminSession();
  if (!user) redirect("/admin/login");

  const articles = await listAllPublishedArticles("ADMIN", user.role);

  return (
    <div className="min-h-screen bg-white p-8 print:p-4">
      <style>{`
        @media print {
          .page-break { break-before: page; }
        }
      `}</style>
      <header className="mb-8 border-b border-line pb-4">
        <h1 className="font-display text-3xl">JoyTogether Home Care — Administrator Manual</h1>
        <p className="text-sm text-muted">Generated from published Help Center articles. Use your browser Print → Save as PDF.</p>
      </header>
      {articles.map((article, index) => (
        <section key={article.id} className={index > 0 ? "page-break mt-8" : ""}>
          <p className="text-xs uppercase tracking-wide text-muted">{article.category.title}</p>
          <h2 className="font-display text-2xl">{article.title}</h2>
          <div className="mt-4">
            <HelpMarkdown content={article.content} />
          </div>
        </section>
      ))}
    </div>
  );
}
