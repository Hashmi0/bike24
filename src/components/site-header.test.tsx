import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteHeader } from "@/components/site-header";

describe("SiteHeader", () => {
  it("links to the bike catalog and cart", () => {
    render(<SiteHeader />);

    expect(
      screen.getByRole("link", { name: "BIKE24 Bundle Builder" }),
    ).toHaveAttribute("href", "/bikes");
    expect(screen.getByRole("link", { name: "Bikes" })).toHaveAttribute(
      "href",
      "/bikes",
    );
    expect(screen.getByRole("link", { name: "Cart" })).toHaveAttribute(
      "href",
      "/cart",
    );
  });
});
