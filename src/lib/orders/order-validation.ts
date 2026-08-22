import type { CartBundle, CartState } from "@/lib/cart/cart-types";
import type { StockAvailability } from "@/lib/stock/stock-types";

import type { StockShortage, StockValidationResult } from "./order-types";

export function getRequiredStock(cart: CartState): Record<string, number> {
  const required: Record<string, number> = {};

  for (const bundle of cart.bundles) {
    required[bundle.bike.id] = (required[bundle.bike.id] ?? 0) + 1;

    for (const accessory of bundle.accessories) {
      required[accessory.id] =
        (required[accessory.id] ?? 0) + accessory.quantity;
    }
  }

  return required;
}

function getProductNames(cart: CartState) {
  const names = new Map<string, string>();

  for (const bundle of cart.bundles) {
    names.set(bundle.bike.id, bundle.bike.name);

    for (const accessory of bundle.accessories) {
      names.set(accessory.id, accessory.name);
    }
  }

  return names;
}

export function validateStock(
  cart: CartState,
  availability: StockAvailability,
): StockValidationResult {
  const required = getRequiredStock(cart);
  const names = getProductNames(cart);
  const shortages: StockShortage[] = [];

  for (const [productId, requested] of Object.entries(required)) {
    const available = availability[productId] ?? 0;

    if (requested > available) {
      shortages.push({
        productId,
        productName: names.get(productId) ?? productId,
        requested,
        available,
      });
    }
  }

  return shortages.length > 0 ? { ok: false, shortages } : { ok: true };
}

export function getOrderProductIds(cart: CartState) {
  return Object.keys(getRequiredStock(cart));
}

export function isCartState(value: unknown): value is CartState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<CartState>;

  return (
    candidate.version === 1 &&
    Array.isArray(candidate.bundles) &&
    candidate.bundles.every(isCartBundle)
  );
}

function isCartBundle(value: unknown): value is CartBundle {
  if (!value || typeof value !== "object") {
    return false;
  }

  const bundle = value as Partial<CartBundle>;
  return (
    typeof bundle.id === "string" &&
    isBike(bundle.bike) &&
    Array.isArray(bundle.accessories) &&
    bundle.accessories.every(
      (accessory) =>
        Boolean(accessory) &&
        typeof accessory === "object" &&
        typeof accessory.id === "string" &&
        typeof accessory.name === "string" &&
        typeof accessory.price === "number" &&
        typeof accessory.taxRate === "number" &&
        Number.isInteger(accessory.quantity) &&
        accessory.quantity > 0,
    )
  );
}

function isBike(value: unknown): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }

  const bike = value as Record<string, unknown>;
  return (
    typeof bike.id === "string" &&
    typeof bike.name === "string" &&
    typeof bike.frameType === "string" &&
    typeof bike.price === "number" &&
    typeof bike.taxRate === "number"
  );
}
