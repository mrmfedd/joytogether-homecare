import { describe, expect, it } from "vitest";

describe("admin manual setup link", () => {
  it("uses accept-invite path with token", () => {
    const base = "https://www.joytogetherhomecare.com";
    const token = "abc123";
    const url = `${base}/admin/accept-invite?token=${token}`;
    expect(url).toBe("https://www.joytogetherhomecare.com/admin/accept-invite?token=abc123");
  });
});