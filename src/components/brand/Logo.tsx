import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  const text = light ? "text-white" : "text-purple-900";
  const sub = light ? "text-purple-100" : "text-purple-600";

  return (
    <Link href="/" className="flex items-center gap-3" aria-label="Joy Together Home Care home">
      <span
        className={`grid h-11 w-11 place-items-center rounded-2xl ${
          light ? "bg-white/15" : "bg-purple-100"
        }`}
        aria-hidden
      >
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
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
      <span className={`leading-tight font-bold ${text}`}>
        Joy Together
        <small className={`mt-1 block text-[9px] font-bold tracking-[0.28em] ${sub}`}>
          HOME CARE
        </small>
      </span>
    </Link>
  );
}
