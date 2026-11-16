import { afterEach, describe, expect, it } from "vitest";
import { site } from "@/content/site";
import { publicSiteBaseUrl } from "@/lib/site-url";
import { buildEmployeeActivationUrl, isPendingEmployeeActivation } from "@/lib/employee/activation";

describe("employee invitation — site URL resolution", () => {
  const prev = process.env.NEXT_PUBLIC_SITE_URL;

  afterEach(() => {
    if (prev === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = prev;
  });

  it("falls back to site.url when NEXT_PUBLIC_SITE_URL is unset", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(publicSiteBaseUrl()).toBe(site.url);
  });

  it("strips trailing slash from env override", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://joytogetherhomecare.com/";
    expect(publicSiteBaseUrl()).toBe("https://joytogetherhomecare.com");
  });

  it("honors explicit override over env", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://preview.example.com";
    expect(publicSiteBaseUrl("https://custom.example.com/")).toBe("https://custom.example.com");
  });
});

describe("employee activation (offline)", () => {
  it("builds /employee/activate URL with token", () => {
    const url = buildEmployeeActivationUrl("https://www.joytogetherhomecare.com/", "abc123");
    expect(url).toBe("https://www.joytogetherhomecare.com/employee/activate?token=abc123");
  });

  it("detects pending admin-provisioned profiles", () => {
    expect(
      isPendingEmployeeActivation({
        passwordHash: null,
        active: false,
        employeeProfile: { employmentStatus: "INVITED" },
      }),
    ).toBe(true);
    expect(
      isPendingEmployeeActivation({
        passwordHash: "hashed",
        active: true,
        employeeProfile: { employmentStatus: "ACTIVE" },
      }),
    ).toBe(false);
  });
});