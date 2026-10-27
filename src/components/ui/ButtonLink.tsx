import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

const variants = {
  purple: "btn btn-purple",
  sage: "btn btn-sage",
  white: "btn btn-white",
  outlineLight: "btn btn-outline-light",
  outlinePurple: "btn btn-outline-purple",
} as const;

type Variant = keyof typeof variants;

type Props = {
  href: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
} & Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "className" | "children">;

export function ButtonLink({
  href,
  variant = "purple",
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <Link href={href} className={`${variants[variant]} ${className}`} {...rest}>
      {children}
    </Link>
  );
}
