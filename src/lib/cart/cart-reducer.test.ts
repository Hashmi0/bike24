import { describe, expect, it } from "vitest";

import { cartReducer } from "./cart-reducer";
import { EMPTY_CART, type CartBundle } from "./cart-types";

const bundle: CartBundle = {
  id: "bundle-1",
  bike: {
    id: "bike-001",
    name: "Test Bike",
    frameType: "Road",
    price: 1000,
    taxRate: 0.19,
  },
  accessories: [],
};

describe("cart reducer", () => {
  it("adds bundles without mutating the previous state", () => {
    const next = cartReducer(EMPTY_CART, { type: "addBundle", bundle });

    expect(next.bundles).toEqual([bundle]);
    expect(EMPTY_CART.bundles).toEqual([]);
  });

  it("removes one bundle and clears the cart", () => {
    const state = cartReducer(
      cartReducer(EMPTY_CART, { type: "addBundle", bundle }),
      { type: "addBundle", bundle: { ...bundle, id: "bundle-2" } },
    );

    expect(cartReducer(state, { type: "removeBundle", bundleId: "bundle-1" }).bundles).toHaveLength(1);
    expect(cartReducer(state, { type: "clear" })).toEqual(EMPTY_CART);
  });
});
