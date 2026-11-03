import Link from "next/link";

type Props = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
};

export function AdminEmptyState({ title, description, actionLabel, actionHref, className = "" }: Props) {
  return (
    <div className={`rounded-2xl border border-dashed border-line bg-[var(--cream)]/40 px-6 py-12 text-center ${className}`}>
      <h2 className="font-display text-xl text-[var(--midnight)]">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted">{description}</p>
      {actionLabel && actionHref ? (
        <Link href={actionHref} className="btn btn-purple mt-6 inline-flex px-5 py-2.5 text-sm">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
