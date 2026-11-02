import { getSiteSetting } from "@/lib/content/public";

export async function isTimeClockEnabled() {
  return getSiteSetting<boolean>("workforce.timeClockEnabled", false);
}
