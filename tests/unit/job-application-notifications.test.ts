import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { site } from "@/content/site";

describe("sendJobApplicationEmail", () => {
  const originalFetch = global.fetch;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.RESEND_FROM = "JoyTogether Home Care <notifications@joytogetherhomecare.com>";
    process.env.NEXT_PUBLIC_SITE_URL = "https://preview.example.com";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("sends to business email with JoyTogether sender and admin link (no resume attachment)", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      expect(body.from).toContain("notifications@joytogetherhomecare.com");
      expect(body.from).not.toMatch(/teezbydesign/i);
      expect(body.to).toEqual([site.contact.email]);
      expect(body.subject).toContain("job application");
      expect(body.text).toContain("Jane Applicant");
      expect(body.text).toContain("Caregiver");
      expect(body.text).toContain("/admin/careers#application-app-123");
      expect(body.attachments).toBeUndefined();
      expect(JSON.stringify(body)).not.toContain("resumeKey");
      return new Response(JSON.stringify({ id: "msg_test_1" }), { status: 200 });
    });
    global.fetch = fetchMock as typeof fetch;

    const { sendJobApplicationEmail } = await import("@/lib/notifications");
    const result = await sendJobApplicationEmail({
      applicationId: "app-123",
      fullName: "Jane Applicant",
      position: "Caregiver",
      email: "jane@example.com",
      phone: "8135550100",
      hasResume: true,
    });

    expect(result.ok).toBe(true);
    expect(result.messageId).toBe("msg_test_1");
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("rejects teezbydesign sender", async () => {
    process.env.RESEND_FROM = "JoyTogether Home Care <noreply@teezbydesign.com>";
    global.fetch = vi.fn() as typeof fetch;
    const { sendJobApplicationEmail } = await import("@/lib/notifications");
    const result = await sendJobApplicationEmail({
      applicationId: "app-1",
      fullName: "A",
      position: "B",
      email: "a@example.com",
      hasResume: false,
    });
    expect(result.ok).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("returns error when Resend is not configured", async () => {
    delete process.env.RESEND_API_KEY;
    const { sendJobApplicationEmail } = await import("@/lib/notifications");
    const result = await sendJobApplicationEmail({
      applicationId: "app-1",
      fullName: "A",
      position: "B",
      email: "a@example.com",
      hasResume: false,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/RESEND not configured/i);
  });
});
