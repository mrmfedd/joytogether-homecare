/** Fallback slug when no DB contextRoutes match (used before seed or for static hints). */
export const ADMIN_CONTEXT_FALLBACK: Record<string, string> = {
  "/admin": "admin-dashboard",
  "/admin/leads": "customer-leads",
  "/admin/consultations": "consultations",
  "/admin/private-duty": "private-duty-services",
  "/admin/services": "services-and-service-areas",
  "/admin/service-areas": "services-and-service-areas",
  "/admin/content": "website-content-management",
  "/admin/media": "media-library",
  "/admin/testimonials": "testimonials-and-reviews",
  "/admin/careers": "careers-management",
  "/admin/employees": "employee-management",
  "/admin/scheduling": "employee-scheduling",
  "/admin/open-shifts": "open-shifts",
  "/admin/time-off": "availability-and-time-off",
  "/admin/notices": "staff-notices-and-communications",
  "/admin/timesheets": "reports-and-analytics",
  "/admin/workforce-reports": "reports-and-analytics",
  "/admin/reports": "reports-and-analytics",
  "/admin/settings": "website-and-system-settings",
  "/admin/account": "administrator-account-and-security",
  "/admin/users": "user-management",
};

export const EMPLOYEE_CONTEXT_FALLBACK: Record<string, string> = {
  "/employee": "understanding-your-dashboard",
  "/employee/schedule": "viewing-daily-and-weekly-schedules",
  "/employee/open-shifts": "viewing-and-requesting-open-shifts",
  "/employee/availability": "managing-work-availability",
  "/employee/time-off": "requesting-time-off",
  "/employee/notices": "viewing-notices-and-announcements",
  "/employee/time-clock": "understanding-notifications",
  "/employee/account": "updating-account-information",
};

export function resolveContextSlug(
  pathname: string,
  fallbackMap: Record<string, string>,
): string | null {
  const path = pathname.split("?")[0] ?? pathname;
  if (fallbackMap[path]) return fallbackMap[path];
  const entries = Object.entries(fallbackMap).sort((a, b) => b[0].length - a[0].length);
  for (const [prefix, slug] of entries) {
    if (prefix !== "/admin" && prefix !== "/employee" && path.startsWith(`${prefix}/`)) {
      return slug;
    }
  }
  return null;
}
