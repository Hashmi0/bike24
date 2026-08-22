import { describe, expect, it } from "vitest";

import type { CartBundle } from "./cart-types";
import {
  calculateBundlePrice,
  calculateLinePrice,
  formatEUR,
} from "./pricing";

const bundle: CartBundle = {
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
};

describe("cart pricing", () => {
  it("calculates tax and gross values in integer cents", () => {
    expect(calculateLinePrice(20, 0.19, 2)).toEqual({
      netMinor: 4000,
      taxMinor: 760,
      grossMinor: 4760,
    });
    expect(calculateBundlePrice(bundle)).toEqual({
      netMinor: 104000,
      taxMinor: 19760,
      grossMinor: 123760,
    });
  });

  it("formats euro values for the storefront locale", () => {
    expect(formatEUR(123456)).toBe("1.234,56 €");
  });
});
