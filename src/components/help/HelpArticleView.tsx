import Link from "next/link";
import { HelpMarkdown } from "./HelpMarkdown";

function extractHeadings(content: string) {
  const lines = content.split("\n");
  const headings: { id: string; text: string; level: number }[] = [];
  for (const line of lines) {
    const m = /^(#{2,3})\s+(.+)$/.exec(line);
    if (!m) continue;
    const text = m[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    headings.push({ id, text, level: m[1].length });
  }
  return headings;
}

export function HelpArticleView({
  title,
  summary,
  content,
  related,
  basePath,
}: {
  title: string;
  summary: string | null;
  content: string;
  related: { slug: string; title: string }[];
  basePath: string;
}) {
  const headings = extractHeadings(content);
  const showToc = headings.length >= 4;

  return (
    <article className="rounded-2xl border border-line bg-white p-6 shadow-sm">
      <header>
        <h1 className="font-display text-2xl text-[var(--midnight)] sm:text-3xl">{title}</h1>
        {summary ? <p className="mt-2 text-sm text-muted">{summary}</p> : null}
      </header>

      {showToc ? (
        <nav aria-label="Table of contents" className="mt-6 rounded-xl bg-[var(--cream)] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">On this page</p>
          <ul className="mt-2 space-y-1 text-sm">
            {headings.map((h) => (
              <li key={h.id} className={h.level === 3 ? "pl-4" : undefined}>
                <a href={`#${h.id}`} className="text-[var(--royal)] hover:underline">
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <div className="mt-6">
        <HelpMarkdown content={content} />
      </div>

      {related.length > 0 ? (
        <section className="mt-10 border-t border-line pt-6">
          <h2 className="font-display text-lg text-[var(--midnight)]">Related articles</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`${basePath}/${r.slug}`} className="font-semibold text-[var(--royal)] hover:underline">
                  {r.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-8 text-center">
        <a href="#top" className="text-sm font-semibold text-[var(--royal)]">
          Back to top
        </a>
      </p>
    </article>
  );
}
