import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Users } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Staff Login",
  description: `Secure staff sign-in for ${site.name} administrators and employees.`,
  robots: { index: false, follow: false },
};

export default function StaffLoginPage() {
  return (
    <section className="section-pad relative flex-1 overflow-hidden bg-sky">
      <div className="brand-curve" aria-hidden />
      <div className="site-container relative mx-auto max-w-3xl">
        <div className="text-center">
          <div className="mx-auto mb-6 flex justify-center">
            <Logo />
          </div>
          <p className="eyebrow-purple">Authorized staff only</p>
          <h1 className="font-display m-0 text-[clamp(2rem,5vw,2.75rem)] text-purple-900">Staff Login</h1>
          <p className="body-muted mx-auto mt-3 max-w-xl">
            Choose the portal that matches your role. Access is by invitation only — there is no public registration.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <StaffPortalCard
            href="/admin/login"
            title="Administrator Login"
            description="Business administration, leads, scheduling, content, and workforce tools."
            icon={Building2}
            cta="Sign in as administrator"
          />
          <StaffPortalCard
            href="/employee/login"
            title="Employee Login"
            description="Your schedule, open shifts, notices, availability, and optional time clock."
            icon={Users}
            cta="Sign in as employee"
          />
        </div>

        <p className="mt-8 text-center text-sm text-muted">
          Need help? Contact{" "}
          <a
            href={site.contact.emailHref}
            className="font-semibold text-[var(--purple-700)] hover:text-[var(--purple-800)]"
          >
            {site.contact.email}
          </a>{" "}
          or call{" "}
          <a
            href={site.contact.phoneHref}
            className="font-semibold text-[var(--purple-700)] hover:text-[var(--purple-800)]"
          >
            {site.contact.phone}
          </a>
          .
        </p>
      </div>
    </section>
  );
}

function StaffPortalCard({
  href,
  title,
  description,
  icon: Icon,
  cta,
}: {
  href: string;
  title: string;
  description: string;
  icon: typeof Building2;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="card-soft group flex h-full flex-col border border-[var(--sky-brand)]/10 p-6 transition-shadow hover:border-[var(--joy-green)]/35 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--joy-green-dark)]"
    >
      <span className="grid h-12 w-12 place-items-center rounded-full bg-[var(--sky-brand)]/12 text-[var(--purple-700)] group-hover:bg-[var(--sky-brand)] group-hover:text-white">
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <h2 className="font-display mt-5 text-xl text-purple-900">{title}</h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{description}</p>
      <span className="mt-6 inline-flex items-center text-sm font-bold uppercase tracking-wide text-[var(--joy-green-dark)] group-hover:text-[var(--purple-800)]">
        {cta}
        <span className="ml-1" aria-hidden>
          →
        </span>
      </span>
    </Link>
  );
}
