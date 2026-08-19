import { describe, expect, it } from "vitest";

import { siteConfig } from "@/config/site";

describe("siteConfig", () => {
  it("publishes the storefront name and primary routes", () => {
    expect(siteConfig).toEqual({
      name: "BIKE24 Bundle Builder",
      description: "Build a bike bundle with compatible accessories.",
      routes: {
        bikes: "/bikes",
        cart: "/cart",
      },
    });
  });
});
