import { describe, expect, it } from "vitest";

import type { CartState } from "@/lib/cart/cart-types";

import { getRequiredStock, isCartState, validateStock } from "./order-validation";

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
    {
      id: "bundle-2",
      bike: {
        id: "bike-002",
        name: "Second Bike",
        frameType: "Road",
        price: 1100,
        taxRate: 0.19,
      },
      accessories: [
        {
          id: "acc-001",
          name: "Bottle Cage",
          price: 20,
          taxRate: 0.19,
          quantity: 1,
        },
      ],
    },
  ],
};

describe("order stock validation", () => {
  it("aggregates repeated product quantities across bundles", () => {
    expect(getRequiredStock(cart)).toEqual({
      "bike-001": 1,
      "acc-001": 3,
      "bike-002": 1,
    });
  });

  it("reports shortages with requested and available quantities", () => {
    expect(
      validateStock(cart, {
        "bike-001": 1,
        "bike-002": 0,
        "acc-001": 2,
      }),
    ).toEqual({
      ok: false,
      shortages: [
        {
          productId: "acc-001",
          productName: "Bottle Cage",
          requested: 3,
          available: 2,
        },
        {
          productId: "bike-002",
          productName: "Second Bike",
          requested: 1,
          available: 0,
        },
      ],
    });
  });

  it("rejects malformed cart snapshots", () => {
    expect(isCartState({ version: 1, bundles: [{ id: "bad" }] })).toBe(false);
    expect(isCartState(cart)).toBe(true);
  });
});
