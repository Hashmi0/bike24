import type { CartBundle, CartState } from "@/lib/cart/cart-types";
import { isAccessoryCompatible } from "@/lib/catalog/compatibility";
import type { Catalog } from "@/lib/catalog/types";
import type { StockAvailability } from "@/lib/stock/stock-types";

import type { StockShortage, StockValidationResult } from "./order-types";

export function getRequiredStock(cart: CartState): Record<string, number> {
  const required = new Map<string, number>();

  for (const bundle of cart.bundles) {
    required.set(bundle.bike.id, (required.get(bundle.bike.id) ?? 0) + 1);

    for (const accessory of bundle.accessories) {
      required.set(
        accessory.id,
        (required.get(accessory.id) ?? 0) + accessory.quantity,
      );
    }
  }

  return Object.fromEntries(required);
}

export type CatalogValidationResult =
  | { ok: true }
  | { ok: false; message: string };

export function validateCartAgainstCatalog(
  cart: CartState,
  catalog: Catalog,
): CatalogValidationResult {
  const bikes = new Map(catalog.bikes.map((bike) => [bike.id, bike]));
  const accessories = new Map(
    catalog.accessories.map((accessory) => [accessory.id, accessory]),
  );

  for (const bundle of cart.bundles) {
    const bike = bikes.get(bundle.bike.id);

    if (!bike) {
      return {
        ok: false,
        message: "The selected bike is no longer available.",
      };
    }

    const quantities = new Map<string, number>();

    for (const item of bundle.accessories) {
      const accessory = accessories.get(item.id);

      if (!accessory) {
        return {
          ok: false,
          message: "One of the selected accessories is no longer available.",
        };
      }

      if (!isAccessoryCompatible(bike, accessory)) {
        return {
          ok: false,
          message: `${accessory.name} is not compatible with this bike.`,
        };
      }

      const requested = (quantities.get(item.id) ?? 0) + item.quantity;

      if (requested > accessory.maxAmount) {
        return {
          ok: false,
          message: `${accessory.name} is limited to ${accessory.maxAmount} per bundle.`,
        };
      }

      quantities.set(item.id, requested);
    }
  }

  return { ok: true };
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
