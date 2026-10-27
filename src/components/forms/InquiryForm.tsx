"use client";

import { site } from "@/content/site";

export function InquiryForm({ subject = "Joy Together Home Care Inquiry" }: { subject?: string }) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const body = `Name: ${data.get("name")}\nEmail: ${data.get("email")}\nPhone: ${data.get("phone")}\nService interest: ${data.get("service")}\n\nMessage:\n${data.get("message")}`;
    window.location.href = `mailto:${site.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form className="inquiry-form card-soft p-8" onSubmit={handleSubmit}>
      <label>
        Your Name
        <input name="name" type="text" required placeholder="Full name" />
      </label>
      <label>
        Email Address
        <input name="email" type="email" required placeholder="you@example.com" />
      </label>
      <label>
        Phone Number
        <input name="phone" type="tel" placeholder={site.contact.phone} />
      </label>
      <label>
        Service Interest
        <select name="service" defaultValue="consultation">
          <option value="consultation">Free consultation</option>
          <option value="companion">Companion care</option>
          <option value="personal">Personal care</option>
          <option value="respite">Respite care</option>
          <option value="hospice">Hospice support</option>
          <option value="training">CPR / training</option>
          <option value="fingerprinting">Fingerprinting</option>
        </select>
      </label>
      <label>
        How can we help?
        <textarea
          name="message"
          required
          placeholder="Tell us about your care needs..."
        />
      </label>
      <button type="submit" className="btn btn-purple w-full">
        Send Message →
      </button>
      <p className="mt-3 text-center text-xs text-muted">
        Opens your email to {site.contact.email}. Or call{" "}
        <a href={site.contact.phoneHref} className="font-bold text-purple-700">
          {site.contact.phone}
        </a>
        .
      </p>
    </form>
  );
}
