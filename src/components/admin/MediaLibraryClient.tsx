"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, useTransition } from "react";

type MediaItem = {
  id: string;
  filename: string;
  altText: string | null;
  url: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
};

export function MediaLibraryClient() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [replaceId, setReplaceId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/media");
    const json = (await res.json()) as { items?: MediaItem[]; error?: string };
    if (!res.ok) {
      setError(json.error || "Failed to load");
      return;
    }
    setItems(json.items || []);
    setError("");
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function onUpload(formData: FormData) {
    startTransition(async () => {
      setError("");
      if (replaceId) formData.set("replaceId", replaceId);
      const res = await fetch("/api/admin/media", { method: "POST", body: formData });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error || "Upload failed");
        return;
      }
      setReplaceId(null);
      await load();
    });
  }

  function onDelete(id: string) {
    if (!confirm("Delete this media asset? Linked testimonials will clear the image.")) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setError("Delete failed");
        return;
      }
      await load();
    });
  }

  async function saveAlt(id: string, altText: string) {
    await fetch(`/api/admin/media/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ altText }),
    });
    await load();
  }

  return (
    <div className="space-y-8">
      <form
        className="rounded-2xl border border-line bg-white p-5"
        onSubmit={(e) => {
          e.preventDefault();
          onUpload(new FormData(e.currentTarget));
          e.currentTarget.reset();
        }}
      >
        <h2 className="font-semibold">{replaceId ? "Replace selected image" : "Upload image"}</h2>
        <p className="mt-1 text-sm text-muted">
          Private Blob storage with secure admin upload. JPEG/PNG/WebP/GIF up to 8MB. Next.js optimizes delivery on pages that use{" "}
          <code className="text-xs">next/image</code>.
        </p>
        {replaceId ? (
          <p className="mt-2 text-xs font-bold text-amber-800">
            Replacing asset {replaceId.slice(0, 8)}…{" "}
            <button type="button" className="underline" onClick={() => setReplaceId(null)}>
              Cancel
            </button>
          </p>
        ) : null}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block flex-1 text-sm font-semibold">
            File
            <input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required className="mt-1 block w-full text-sm" />
          </label>
          <label className="block flex-1 text-sm font-semibold">
            Alt text
            <input name="altText" placeholder="Describe the image" className="mt-1 w-full rounded-xl border border-line px-3 py-2 text-sm" />
          </label>
          <button type="submit" disabled={pending} className="btn btn-purple px-4 py-2 text-sm disabled:opacity-60">
            {pending ? "Working…" : replaceId ? "Replace" : "Upload"}
          </button>
        </div>
        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      </form>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.id} className="overflow-hidden rounded-2xl border border-line bg-white">
            <div className="relative h-40 bg-cream">
              <Image src={item.url} alt={item.altText || ""} fill className="object-cover" sizes="320px" unoptimized />
            </div>
            <div className="space-y-2 p-3 text-sm">
              <p className="truncate font-semibold">{item.filename}</p>
              <p className="text-xs text-muted">
                {(item.sizeBytes / 1024).toFixed(0)} KB · {item.mimeType}
              </p>
              <label className="block text-xs font-semibold">
                Alt text
                <input
                  defaultValue={item.altText || ""}
                  className="mt-1 w-full rounded-lg border border-line px-2 py-1"
                  onBlur={(e) => {
                    if (e.target.value !== (item.altText || "")) void saveAlt(item.id, e.target.value);
                  }}
                />
              </label>
              <p className="break-all text-[11px] text-muted">{item.url}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button type="button" className="text-xs font-bold text-[var(--royal)]" onClick={() => setReplaceId(item.id)}>
                  Replace file
                </button>
                <button type="button" className="text-xs font-bold text-red-700" onClick={() => onDelete(item.id)}>
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {items.length === 0 ? <p className="text-sm text-muted">No media uploaded yet.</p> : null}
    </div>
  );
}
