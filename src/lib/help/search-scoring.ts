export function scoreMatch(query: string, fields: (string | null | undefined)[]): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const terms = q.split(/\s+/).filter(Boolean);
  let score = 0;
  for (const field of fields) {
    if (!field) continue;
    const hay = field.toLowerCase();
    for (const term of terms) {
      if (hay === term) score += 8;
      else if (hay.startsWith(term)) score += 5;
      else if (hay.includes(term)) score += 2;
    }
  }
  return score;
}
