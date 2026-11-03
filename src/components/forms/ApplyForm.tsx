"use client";

import { useState } from "react";

export function ApplyForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const res = await fetch("/api/applications", { method: "POST", body: data });
      const json = (await res.json()) as { ok?: boolean; error?: string; message?: string };
      if (!res.ok || !json.ok) {
        setError(json.error || "Something went wrong.");
        setStatus("error");
        return;
      }
      setStatus("success");
      form.reset();
    } catch {
      setError("Network error. Please try again or email us directly.");
      setStatus("error");
    }
  }

  return (
    <form className="inquiry-form card-soft mx-auto max-w-xl p-8" onSubmit={handleSubmit}>
      <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
      <label>
        Full Name
        <input name="name" type="text" required disabled={status === "loading"} />
      </label>
      <label>
        Email
        <input name="email" type="email" required disabled={status === "loading"} />
      </label>
      <label>
        Phone
        <input name="phone" type="tel" disabled={status === "loading"} />
      </label>
      <label>
        Position of Interest
        <input name="position" type="text" required placeholder="Caregiver, CNA, HHA, etc." disabled={status === "loading"} />
      </label>
      <label>
        Resume (PDF or Word, max 5MB)
        <input name="resume" type="file" accept=".pdf,.doc,.docx,application/pdf" disabled={status === "loading"} />
      </label>
      <label>
        Message
        <textarea name="message" placeholder="Tell us about your experience..." disabled={status === "loading"} />
      </label>
      <button type="submit" className="btn btn-purple w-full" disabled={status === "loading"}>
        {status === "loading" ? "Submitting…" : "Submit application →"}
      </button>
      {status === "success" ? (
        <p className="mt-3 text-center text-sm text-[var(--joy-green)]">Application received. We will be in touch soon.</p>
      ) : null}
      {error ? <p className="mt-3 text-center text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
