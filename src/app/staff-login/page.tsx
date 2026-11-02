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
    <section className="section-pad bg-gradient-to-b from-purple-50 to-cream flex-1">
      <div className="site-container mx-auto max-w-3xl">
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
          <a href={site.contact.emailHref} className="font-semibold text-purple-700 hover:text-purple-900">
            {site.contact.email}
          </a>{" "}
          or call{" "}
          <a href={site.contact.phoneHref} className="font-semibold text-purple-700 hover:text-purple-900">
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
      className="card-soft group flex h-full flex-col p-6 transition-shadow hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
    >
      <span className="grid h-12 w-12 place-items-center rounded-full bg-teal/15 text-teal group-hover:bg-teal group-hover:text-white">
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <h2 className="font-display mt-5 text-xl text-purple-900">{title}</h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{description}</p>
      <span className="mt-6 inline-flex items-center text-sm font-bold uppercase tracking-wide text-purple-700 group-hover:text-purple-900">
        {cta}
        <span className="ml-1" aria-hidden>
          →
        </span>
      </span>
    </Link>
  );
}
