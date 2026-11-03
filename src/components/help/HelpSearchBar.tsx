"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Search } from "lucide-react";
import type { HelpSearchHit } from "@/lib/help/search";

export function HelpSearchBar({
  basePath,
  initialQuery,
  categorySlug,
  onSearch,
}: {
  basePath: string;
  initialQuery?: string;
  categorySlug?: string;
  onSearch: (query: string, categorySlug?: string) => Promise<HelpSearchHit[]>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery ?? searchParams.get("q") ?? "");
  const [results, setResults] = useState<HelpSearchHit[] | null>(null);
  const [pending, startTransition] = useTransition();

  const runSearch = useCallback(
    (q: string) => {
      startTransition(async () => {
        if (q.trim().length < 2) {
          setResults(null);
          return;
        }
        const hits = await onSearch(q, categorySlug);
        setResults(hits);
        const params = new URLSearchParams(searchParams.toString());
        params.set("q", q);
        router.replace(`${basePath}?${params.toString()}`, { scroll: false });
      });
    },
    [basePath, categorySlug, onSearch, router, searchParams],
  );

  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
      <label className="sr-only" htmlFor="help-search">
        Search help articles
      </label>
      <div className="flex items-center gap-2 rounded-xl border border-line bg-[var(--cream)] px-3 py-2">
        <Search className="h-5 w-5 text-muted" aria-hidden />
        <input
          id="help-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") runSearch(query);
          }}
          placeholder="Search by topic, task, or keyword…"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          autoComplete="off"
        />
        <button
          type="button"
          disabled={pending}
          onClick={() => runSearch(query)}
          className="rounded-lg bg-[var(--royal)] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
        >
          Search
        </button>
      </div>
      {results && query.trim().length >= 2 ? (
        <div className="mt-4">
          {results.length === 0 ? (
            <p className="text-sm text-muted">
              No articles matched. Try broader terms like &quot;schedule&quot;, &quot;invitation&quot;, or &quot;password&quot;.
            </p>
          ) : (
            <ul className="space-y-2">
              {results.map((hit) => (
                <li key={hit.id}>
                  <a
                    href={`${basePath}/${hit.slug}`}
                    className="block rounded-xl border border-line px-3 py-2 hover:bg-[var(--cream)]"
                  >
                    <p className="font-semibold text-[var(--midnight)]">{hit.title}</p>
                    <p className="text-xs text-muted">{hit.categoryTitle}</p>
                    {hit.summary ? <p className="mt-1 text-sm text-muted">{hit.summary}</p> : null}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
