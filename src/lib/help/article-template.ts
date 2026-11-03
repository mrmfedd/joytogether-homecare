const APP_VERSION = "0.1.0";

export type ManualSection = {
  title: string;
  purpose: string;
  who: string;
  beforeYouBegin?: string[];
  steps: string[];
  expectedResult: string;
  notes?: string[];
  troubleshooting?: { question: string; answer: string }[];
  relatedSlugs?: string[];
};

export function buildManualMarkdown(section: ManualSection, lastUpdated: string): string {
  const lines: string[] = [
    `## Purpose`,
    section.purpose,
    ``,
    `## Who can perform this task`,
    section.who,
  ];

  if (section.beforeYouBegin?.length) {
    lines.push(``, `## Before you begin`, ...section.beforeYouBegin.map((b) => `- ${b}`));
  }

  lines.push(
    ``,
    `## Step-by-step instructions`,
    ...section.steps.map((step, i) => `${i + 1}. ${step}`),
    ``,
    `## Expected result`,
    section.expectedResult,
  );

  if (section.notes?.length) {
    lines.push(``, `## Important notes`, ...section.notes.map((n) => `- ${n}`));
  }

  if (section.troubleshooting?.length) {
    lines.push(``, `## Troubleshooting`);
    for (const t of section.troubleshooting) {
      lines.push(``, `**${t.question}**`, t.answer);
    }
  }

  if (section.relatedSlugs?.length) {
    lines.push(
      ``,
      `## Related articles`,
      ...section.relatedSlugs.map((s) => `- See article \`${s}\` in this Help Center.`),
    );
  }

  lines.push(``, `---`, `*Last updated: ${lastUpdated} · Application version ${APP_VERSION}*`);

  return lines.join("\n");
}

export { APP_VERSION };
