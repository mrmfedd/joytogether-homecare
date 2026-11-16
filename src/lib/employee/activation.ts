import { publicSiteBaseUrl } from "@/lib/site-url";

export function buildEmployeeActivationUrl(baseUrl: string, token: string): string {
  const base = publicSiteBaseUrl(baseUrl);
  return `${base}/employee/activate?token=${token}`;
}

export function isPendingEmployeeActivation(user: {
  passwordHash: string | null;
  active: boolean;
  employeeProfile: { employmentStatus: string } | null;
}): boolean {
  return (
    !user.passwordHash &&
    !user.active &&
    user.employeeProfile?.employmentStatus === "INVITED"
  );
}