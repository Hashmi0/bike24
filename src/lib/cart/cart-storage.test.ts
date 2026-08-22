import { describe, expect, it } from "vitest";

import { loadCart, saveCart, STORAGE_KEY } from "./cart-storage";
import { EMPTY_CART } from "./cart-types";

function createStorage() {
  const values = new Map<string, string>();

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    clear: () => values.clear(),
    key: () => null,
    length: 0,
  } as Storage;
}

describe("cart storage", () => {
  it("round trips a cart through local storage", () => {
    const storage = createStorage();
    const cart = { version: 1 as const, bundles: [] };

    saveCart(cart, storage);

    expect(storage.getItem(STORAGE_KEY)).toContain('"version":1');
    expect(loadCart(storage)).toEqual(cart);
  });

  it("falls back to an empty cart for malformed data", () => {
    const storage = createStorage();
    storage.setItem(STORAGE_KEY, "not-json");
    expect(loadCart(storage)).toEqual(EMPTY_CART);

    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, bundles: [] }));
    expect(loadCart(storage)).toEqual(EMPTY_CART);
  });
});
