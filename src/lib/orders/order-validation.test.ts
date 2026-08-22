import { describe, expect, it } from "vitest";

import type { CartState } from "@/lib/cart/cart-types";
import type { Catalog } from "@/lib/catalog/types";

import {
  getRequiredStock,
  isCartState,
  validateCartAgainstCatalog,
  validateStock,
} from "./order-validation";

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

const catalog: Catalog = {
  bikes: [cart.bundles[0].bike, cart.bundles[1].bike],
  accessories: [
    {
      id: "acc-001",
      name: "Bottle Cage",
      price: 20,
      taxRate: 0.19,
      compatibleFrameTypes: ["Road"],
      maxAmount: 4,
    },
    {
      id: "acc-002",
      name: "Mountain Gear",
      price: 30,
      taxRate: 0.19,
      compatibleFrameTypes: ["Mountain"],
      maxAmount: 2,
    },
  ],
};

function withFirstAccessory(
  state: CartState,
  update: (accessory: CartState["bundles"][number]["accessories"][number]) => CartState["bundles"][number]["accessories"][number],
): CartState {
  return {
    ...state,
    bundles: state.bundles.map((bundle, bundleIndex) =>
      bundleIndex === 0
        ? {
            ...bundle,
            accessories: bundle.accessories.map((accessory, accessoryIndex) =>
              accessoryIndex === 0 ? update(accessory) : accessory,
            ),
          }
        : bundle,
    ),
  };
}

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

  it("enforces catalog compatibility and per-bundle limits", () => {
    expect(validateCartAgainstCatalog(cart, catalog)).toEqual({ ok: true });

    const invalidQuantity = withFirstAccessory(cart, (accessory) => ({
      ...accessory,
      quantity: 5,
    }));
    expect(validateCartAgainstCatalog(invalidQuantity, catalog)).toEqual({
      ok: false,
      message: "Bottle Cage is limited to 4 per bundle.",
    });

    const invalidAccessory = withFirstAccessory(cart, (accessory) => ({
      ...accessory,
      id: "acc-002",
    }));
    expect(validateCartAgainstCatalog(invalidAccessory, catalog)).toEqual({
      ok: false,
      message: "Mountain Gear is not compatible with this bike.",
    });
  });

  it("rejects a bike that is no longer in the catalog", () => {
    const invalidBike: CartState = {
      ...cart,
      bundles: cart.bundles.map((bundle, bundleIndex) =>
        bundleIndex === 0
          ? { ...bundle, bike: { ...bundle.bike, id: "bike-missing" } }
          : bundle,
      ),
    };

    expect(validateCartAgainstCatalog(invalidBike, catalog)).toEqual({
      ok: false,
      message: "The selected bike is no longer available.",
    });
  });
});
