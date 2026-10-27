import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  const text = light ? "text-white" : "text-purple-900";
  const sub = light ? "text-purple-100" : "text-purple-600";

  return (
    <Link
      href="/"
      className="flex min-w-0 max-w-[calc(100vw-5rem)] items-center gap-2 sm:max-w-none sm:gap-3"
      aria-label="Joy Together Home Care home"
    >
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl lg:h-11 lg:w-11 lg:rounded-2xl ${
          light ? "bg-white/15" : "bg-purple-100"
        }`}
        aria-hidden
      >
        <svg className="h-[22px] w-[22px] lg:h-[26px] lg:w-[26px]" viewBox="0 0 26 26" fill="none">
          <path
            d="M13 3L4 10v11h7v-6h4v6h7V10L13 3z"
            fill={light ? "#fff" : "#5c4d7a"}
          />
          <path
            d="M13 14c-1.2 1.4-3.4 2.6-3.4 4.2 0 1.2 1 2 2.2 2 1.4 0 2.2-1 2.2-1s.8 1 2.2 1c1.2 0 2.2-.8 2.2-2 0-1.6-2.2-2.8-3.4-4.2z"
            fill={light ? "#c9b8e8" : "#8fa88a"}
          />
        </svg>
      </span>
      <span className={`min-w-0 leading-tight font-bold ${text}`}>
        <span className="block truncate text-[15px] lg:text-[20px]">Joy Together</span>
        <small
          className={`mt-0.5 hidden text-[9px] font-bold tracking-[0.28em] sm:block ${sub}`}
        >
          HOME CARE
        </small>
      </span>
    </Link>
  );
}
