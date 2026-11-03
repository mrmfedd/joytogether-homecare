"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useState } from "react";

type MediaItem = {
  id: string;
  filename: string;
  altText: string | null;
  url: string;
  mimeType: string;
};

export function MediaPicker({
  name,
  label = "Image",
  defaultUrl = "",
  defaultMediaId = "",
}: {
  name: string;
  label?: string;
  defaultUrl?: string;
  defaultMediaId?: string;
}) {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [selectedUrl, setSelectedUrl] = useState(defaultUrl);
  const [selectedId, setSelectedId] = useState(defaultMediaId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/media");
      const json = (await res.json()) as { items?: MediaItem[]; error?: string };
      if (!res.ok) throw new Error(json.error || "Failed to load media");
      setItems(json.items || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">{label}</p>
      <input type="hidden" name={name} value={selectedUrl} />
      <input type="hidden" name={`${name}MediaId`} value={selectedId} />
      <div className="flex flex-wrap items-center gap-3">
        {selectedUrl ? (
          <div className="relative h-20 w-32 overflow-hidden rounded-lg border border-line bg-cream">
            <Image src={selectedUrl} alt="" fill className="object-cover" sizes="128px" unoptimized={selectedUrl.startsWith("/api/")} />
          </div>
        ) : (
          <div className="grid h-20 w-32 place-items-center rounded-lg border border-dashed border-line text-xs text-muted">
            No image
          </div>
        )}
        <button type="button" onClick={() => setOpen(true)} className="btn btn-purple px-3 py-2 text-xs">
          Choose from library
        </button>
        {selectedUrl ? (
          <button
            type="button"
            className="text-xs font-bold text-amber-800"
            onClick={() => {
              setSelectedUrl("");
              setSelectedId("");
            }}
          >
            Clear
          </button>
        ) : null}
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-purple-900/50 p-0 sm:items-center sm:p-6"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 id={titleId} className="font-display text-xl">
                Media library
              </h2>
              <button type="button" className="text-sm font-bold text-[var(--royal)]" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            {loading ? <p className="mt-4 text-sm text-muted">Loading…</p> : null}
            {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="overflow-hidden rounded-xl border border-line text-left hover:border-[var(--royal)]"
                  onClick={() => {
                    setSelectedUrl(item.url);
                    setSelectedId(item.id);
                    setOpen(false);
                  }}
                >
                  <div className="relative h-28 w-full bg-cream">
                    <Image src={item.url} alt={item.altText || ""} fill className="object-cover" sizes="200px" unoptimized />
                  </div>
                  <p className="truncate px-2 py-1.5 text-[11px] font-medium">{item.filename}</p>
                </button>
              ))}
            </div>
            {items.length === 0 && !loading ? (
              <p className="mt-4 text-sm text-muted">
                No uploads yet. Add files in <a href="/admin/media" className="font-bold text-[var(--royal)]">Media</a>.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
