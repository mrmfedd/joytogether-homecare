function FloralIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 48"
      className={`h-10 w-7 shrink-0 opacity-90 ${className}`}
      aria-hidden
    >
      <path
        d="M16 44V8M16 20c-4-6-10-4-10 2s6 8 10 2M16 28c4-6 10-4 10 2s-6 8-10 2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="6" r="2" fill="currentColor" />
    </svg>
  );
}

export function AnnouncementBar() {
  return (
    <div
      className="border-b border-[#0088e8]/30 bg-[#0095ff] px-3 py-3 text-center text-purple-950 sm:px-4 sm:py-3.5"
      role="region"
      aria-label="Service area announcement"
    >
      <p className="font-display mx-auto flex max-w-5xl items-center justify-center gap-3 text-[15px] leading-snug sm:gap-5 sm:text-lg md:text-xl">
        <FloralIcon className="hidden sm:block" />
        <span>Delivering High-Quality Home Care Across the Tampa Bay Area</span>
        <FloralIcon className="hidden rotate-12 sm:block" />
      </p>
    </div>
  );
}
