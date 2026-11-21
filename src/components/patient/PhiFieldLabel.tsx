export function PhiFieldLabel({ children }: { children: React.ReactNode }) {
  return (
  <span className="inline-flex items-center gap-2">
      {children}
      <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900">
        PHI
      </span>
    </span>
  );
}