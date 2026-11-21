/** Display ID for charts and labels — not used for authorization. */
export function formatPatientPublicId(sequence: number, year = new Date().getFullYear()) {
  return `JT-${year}-${String(sequence).padStart(5, "0")}`;
}