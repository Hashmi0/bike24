import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EMPTY_CART, type CartState } from "@/lib/cart/cart-types";

const cartMock = vi.hoisted(() => ({ useCart: vi.fn() }));

vi.mock("./cart-provider", () => cartMock);

import { CartView } from "./cart-view";

const cart: CartState = {
  version: 1,
  bundles: [
    {
      id: "bundle-1",
      bike: {
        id: "bike-001",
        name: "Test Bike",
        frameType: "Road",
        price: 1000,
        taxRate: 0.19,
      },
      accessories: [
        {
          id: "acc-001",
          name: "Bottle Cage",
          price: 20,
          taxRate: 0.19,
          quantity: 2,
        },
      ],
    },
  ],
};

function setCartState(state: CartState = cart) {
  cartMock.useCart.mockReturnValue({
    state,
    isHydrated: true,
    removeBundle: vi.fn(),
    clearCart: vi.fn(),
  });
}

describe("CartView", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders the empty state", () => {
    setCartState(EMPTY_CART);

    render(<CartView />);

    expect(screen.getByText("Your cart is empty")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Place order" })).toBeNull();
  });

  it("shows bundle cards and an order summary", () => {
    setCartState();

    render(<CartView />);

    expect(screen.getByRole("heading", { name: "Test Bike" })).toBeVisible();
    expect(screen.getByText("Bottle Cage × 2")).toBeVisible();
    expect(screen.getByText("Net total")).toBeVisible();
    expect(screen.getByRole("button", { name: "Place order" })).toBeEnabled();
  });

  it("clears the cart after a successful simulated order", async () => {
    const user = userEvent.setup();
    const clearCart = vi.fn();
    cartMock.useCart.mockReturnValue({
      state: cart,
      isHydrated: true,
      removeBundle: vi.fn(),
      clearCart,
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ orderId: "order-123" }),
      })),
    );

    render(<CartView />);
    await user.click(screen.getByRole("button", { name: "Place order" }));

    await waitFor(() => expect(clearCart).toHaveBeenCalledOnce());
    expect(screen.getByText("Thanks for your order")).toBeVisible();
  });

  it("keeps the cart when stock validation fails", async () => {
    const user = userEvent.setup();
    const clearCart = vi.fn();
    cartMock.useCart.mockReturnValue({
      state: cart,
      isHydrated: true,
      removeBundle: vi.fn(),
      clearCart,
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        json: async () => ({
          error: {
            message: "Some items are no longer available.",
            shortages: [
              {
                productId: "acc-001",
                productName: "Bottle Cage",
                requested: 2,
                available: 0,
              },
            ],
          },
        }),
      })),
    );

    render(<CartView />);
    await user.click(screen.getByRole("button", { name: "Place order" }));

    expect(await screen.findByText("Some items are no longer available.")).toBeVisible();
    expect(screen.getByText(/Bottle Cage: requested 2, available 0/)).toBeVisible();
    expect(clearCart).not.toHaveBeenCalled();
  });
});
