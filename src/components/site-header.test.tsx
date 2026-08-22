import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteHeader } from "@/components/site-header";
import { CartProvider } from "@/components/cart/cart-provider";

describe("SiteHeader", () => {
  it("links to the bike catalog and cart", () => {
    render(
      <CartProvider>
        <SiteHeader />
      </CartProvider>,
    );

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
