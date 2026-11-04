export type ReportDateRange = {
  from: Date;
  to: Date;
};

export function parseReportDateRange(searchParams: {
  from?: string;
  to?: string;
}): ReportDateRange {
  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1);
  const from = searchParams.from ? startOfDay(new Date(searchParams.from)) : defaultFrom;
  const to = searchParams.to ? endOfDay(new Date(searchParams.to)) : endOfDay(now);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
    return { from: defaultFrom, to: endOfDay(now) };
  }
  return { from, to };
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function formatReportPeriod(range: ReportDateRange) {
  return `${range.from.toLocaleDateString()} – ${range.to.toLocaleDateString()}`;
}
