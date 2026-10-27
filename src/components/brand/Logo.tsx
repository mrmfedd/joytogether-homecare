import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`inline-flex shrink-0 items-center ${
        light ? "rounded-lg bg-white/95 p-2 shadow-sm" : ""
      }`}
      aria-label="Joy Together Home Care home"
    >
      <Image
        src={site.images.logo}
        alt="Joy Together Home Care"
        width={404}
        height={236}
        className="h-12 w-auto max-w-[min(260px,calc(100vw-4.25rem))] object-contain object-left sm:h-14 sm:max-w-[300px] lg:h-16 lg:max-w-[340px]"
        priority
      />
    </Link>
  );
}
