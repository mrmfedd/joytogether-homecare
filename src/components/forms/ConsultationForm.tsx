"use client";

import { useState } from "react";
import { site } from "@/content/site";

const careOptions = [
  "Skilled nursing",
  "Hospice care",
  "Private duty care",
  "Personal care",
  "Companionship",
  "Respite care",
  "Transportation",
  "Not sure",
];

export function ConsultationForm({ source = "contact-page" }: { source?: string }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");
    const form = new FormData(e.currentTarget);
    const payload = {
      source,
      fullName: String(form.get("fullName") || ""),
      phone: String(form.get("phone") || ""),
      email: String(form.get("email") || ""),
      careType: String(form.get("careType") || ""),
      preferredContact: String(form.get("preferredContact") || ""),
      location: String(form.get("location") || ""),
      callbackTime: String(form.get("callbackTime") || ""),
      consent: form.get("consent") === "on",
      website: String(form.get("website") || ""),
      message: String(form.get("message") || ""),
    };

    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; notice?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Unable to submit.");
      }
      setStatus("success");
      setMessage(
        data.notice ||
          "Thank you. Your consultation request was received. We will contact you soon.",
      );
      e.currentTarget.reset();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <form className="inquiry-form rounded-[1.5rem] border border-line bg-white p-6 shadow-sm sm:p-8" onSubmit={onSubmit}>
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />
      <label>
        Full name
        <input name="fullName" required autoComplete="name" />
      </label>
      <label>
        Phone number
        <input name="phone" type="tel" required autoComplete="tel" placeholder={site.contact.phone} />
      </label>
      <label>
        Email address
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label>
        General type of care requested
        <select name="careType" required defaultValue="" className="mt-1 w-full rounded-[10px] border border-[#d5cfe0] bg-white px-3.5 py-3">
          <option value="" disabled>
            Select one
          </option>
          {careOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </label>
      <label>
        Preferred contact method
        <select name="preferredContact" required defaultValue="phone" className="mt-1 w-full rounded-[10px] border border-[#d5cfe0] bg-white px-3.5 py-3">
          <option value="phone">Phone</option>
          <option value="email">Email</option>
          <option value="either">Either</option>
        </select>
      </label>
      <label>
        General location or ZIP code
        <input name="location" required autoComplete="postal-code" placeholder="Apollo Beach / 33572" />
      </label>
      <label>
        Preferred callback time (optional)
        <input name="callbackTime" placeholder="Weekday mornings" />
      </label>
      <label>
        Anything else we should know? (optional — no medical records)
        <textarea name="message" rows={4} placeholder="General goals or questions only" />
      </label>
      <label className="!mb-4 flex items-start gap-3 font-medium">
        <input type="checkbox" name="consent" required className="mt-1" />
        <span>I consent to be contacted by JoyTogether Home Care about care options.</span>
      </label>

      <button type="submit" className="btn btn-gold w-full uppercase tracking-wide" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Request a Consultation"}
      </button>

      {message ? (
        <p
          className={`mt-4 text-sm font-semibold ${
            status === "error" ? "text-red-700" : "text-purple-800"
          }`}
          role="status"
        >
          {message}
        </p>
      ) : (
        <p className="mt-4 text-xs text-muted">
          Do not include diagnoses, Social Security numbers, insurance IDs, or medical records. For
          urgent needs, call{" "}
          <a href={site.contact.phoneHref} className="font-bold text-purple-700">
            {site.contact.phone}
          </a>
          .
        </p>
      )}
    </form>
  );
}
