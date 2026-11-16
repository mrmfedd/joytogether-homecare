import { afterEach, describe, expect, it } from "vitest";
import { site } from "@/content/site";
import { publicSiteBaseUrl } from "@/lib/site-url";

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