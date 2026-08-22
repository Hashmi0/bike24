import { EMPTY_CART, type CartState } from "./cart-types";

export const STORAGE_KEY = "bike24:cart:v1";

function isCartState(value: unknown): value is CartState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<CartState>;

  return (
    candidate.version === 1 &&
    Array.isArray(candidate.bundles) &&
    candidate.bundles.every((bundle) => {
      if (!bundle || typeof bundle !== "object") {
        return false;
      }

      const item = bundle as Partial<CartState["bundles"][number]>;
      return (
        typeof item.id === "string" &&
        Boolean(item.bike) &&
        typeof item.bike === "object" &&
        Array.isArray(item.accessories)
      );
    })
  );
}

export function loadCart(storage?: Storage): CartState {
  try {
    const source = storage ?? window.localStorage;
    const serialized = source.getItem(STORAGE_KEY);

    if (!serialized) {
      return EMPTY_CART;
    }

    const parsed: unknown = JSON.parse(serialized);
    return isCartState(parsed) ? parsed : EMPTY_CART;
  } catch {
    return EMPTY_CART;
  }
}

export function saveCart(state: CartState, storage?: Storage) {
  try {
    const target = storage ?? window.localStorage;
    target.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Persistence is best effort; the in-memory cart remains usable.
  }
}
