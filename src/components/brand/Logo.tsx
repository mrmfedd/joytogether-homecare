import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";

/** Official logo asset is 360×180 (2:1). */
const LOGO_WIDTH = 360;
const LOGO_HEIGHT = 180;

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`inline-flex shrink-0 items-center ${
        light ? "rounded-xl bg-white/95 p-2.5 shadow-sm" : ""
      }`}
      aria-label="Joy Together Home Care home"
    >
      <Image
        src={site.images.logo}
        alt="Joy Together Home Care — Caring People. A Brighter Tomorrow."
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        className="h-[3.25rem] w-auto max-w-[min(300px,calc(100vw-3.5rem))] object-contain object-left sm:h-[3.75rem] sm:max-w-[340px] lg:h-[5.25rem] lg:max-w-[420px]"
        priority
      />
    </Link>
  );
}
