import { AnimatedPageHero } from "@/components/layout/AnimatedPageHero";

export function PageHero(props: {
  eyebrow?: string;
  title: string;
  description?: string;
  cta?: { label: string; href: string };
}) {
  return <AnimatedPageHero {...props} />;
}
