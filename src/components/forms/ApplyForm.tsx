"use client";

import { site } from "@/content/site";

export function ApplyForm() {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const body = `Applicant: ${data.get("name")}\nEmail: ${data.get("email")}\nPhone: ${data.get("phone")}\nPosition: ${data.get("position")}\n\nNote: Attach your resume to the email after it opens.\n\nMessage:\n${data.get("message")}`;
    window.location.href = `mailto:${site.contact.email}?subject=${encodeURIComponent("Job Application - Joy Together Home Care")}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form className="inquiry-form card-soft mx-auto max-w-xl p-8" onSubmit={handleSubmit}>
      <label>
        Full Name
        <input name="name" type="text" required />
      </label>
      <label>
        Email
        <input name="email" type="email" required />
      </label>
      <label>
        Phone
        <input name="phone" type="tel" />
      </label>
      <label>
        Position of Interest
        <input name="position" type="text" placeholder="Caregiver, CNA, HHA, etc." />
      </label>
      <label>
        Message
        <textarea name="message" placeholder="Tell us about your experience..." />
      </label>
      <button type="submit" className="btn btn-purple w-full">Apply via Email →</button>
      <p className="mt-3 text-center text-xs text-muted">
        Your email app will open — please attach your resume before sending.
      </p>
    </form>
  );
}
