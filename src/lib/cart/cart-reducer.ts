import { EMPTY_CART, type CartBundle, type CartState } from "./cart-types";

export type CartAction =
  | { type: "addBundle"; bundle: CartBundle }
  | { type: "removeBundle"; bundleId: string }
  | { type: "clear" };

export function cartReducer(
  state: CartState = EMPTY_CART,
  action: CartAction,
): CartState {
  switch (action.type) {
    case "addBundle":
      return { version: 1, bundles: [...state.bundles, action.bundle] };
    case "removeBundle":
      return {
        version: 1,
        bundles: state.bundles.filter((bundle) => bundle.id !== action.bundleId),
      };
    case "clear":
      return { version: 1, bundles: [] };
    default:
      return state;
  }
}
