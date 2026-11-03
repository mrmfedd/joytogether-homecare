import { ContextHelpButton } from "@/components/help/ContextHelpButton";
import type { HelpAudience, UserRole } from "@/generated/prisma";

export function HelpPageHeader({
  audience,
  role,
  pathname,
  title,
  description,
}: {
  audience: HelpAudience;
  role: UserRole;
  pathname: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="font-display text-3xl text-[var(--midnight)]">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      <ContextHelpButton audience={audience} role={role} pathname={pathname} />
    </div>
  );
}
