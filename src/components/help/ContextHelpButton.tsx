import { getHelpArticleBySlug } from "@/lib/help/queries";
import { ADMIN_CONTEXT_FALLBACK, EMPLOYEE_CONTEXT_FALLBACK, resolveContextSlug } from "@/lib/help/context-routes";
import type { HelpAudience, UserRole } from "@/generated/prisma";
import { HelpContextLink } from "@/components/help/HelpContextLink";

export async function ContextHelpButton({
  audience,
  role,
  pathname,
  label,
}: {
  audience: HelpAudience;
  role: UserRole;
  pathname: string;
  label?: string;
}) {
  const fallback = audience === "ADMIN" ? ADMIN_CONTEXT_FALLBACK : EMPLOYEE_CONTEXT_FALLBACK;
  const slug = resolveContextSlug(pathname, fallback);
  const basePath = audience === "ADMIN" ? "/admin/help" : "/employee/help";

  if (!slug) {
    return <HelpContextLink label={label} />;
  }

  const article = await getHelpArticleBySlug(audience, slug, role);

  return (
    <HelpContextLink
      label={label}
      article={
        article
          ? { slug: article.slug, title: article.title, content: article.content, basePath }
          : null
      }
    />
  );
}
