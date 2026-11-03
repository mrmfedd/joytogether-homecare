import { describe, expect, it } from "vitest";
import { processNotificationRetries } from "@/lib/notifications";

describe("processNotificationRetries", () => {
  it("exports job application retry handler alongside lead retries", () => {
    expect(typeof processNotificationRetries).toBe("function");
  });
});
