import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`inline-flex shrink-0 items-center ${
        light ? "rounded-lg bg-white/95 p-1.5 shadow-sm" : ""
      }`}
      aria-label="Joy Together Home Care home"
    >
      <Image
        src={site.images.logo}
        alt="Joy Together Home Care"
        width={220}
        height={72}
        className="h-10 w-auto max-w-[min(200px,calc(100vw-5.5rem))] object-contain object-left sm:h-11 lg:h-12"
        priority
      />
    </Link>
  );
}
