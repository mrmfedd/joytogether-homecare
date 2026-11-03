export function isJwtSessionValid(input: {
  active: boolean;
  dbSessionVersion: number;
  tokenSessionVersion: number | undefined;
}): boolean {
  if (!input.active) return false;
  const tokenVersion = input.tokenSessionVersion ?? 0;
  return input.dbSessionVersion === tokenVersion;
}
