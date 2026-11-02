"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function StickyConsultButton() {
  const pathname = usePathname();
  if (pathname === "/contact" || pathname === "/apply") return null;

  return (
    <div className="sticky-consult">
      <Link
        href="/contact"
        className="btn btn-gold shadow-xl uppercase tracking-wide"
        data-track="sticky-consult"
      >
        Free Consultation
      </Link>
    </div>
  );
}
