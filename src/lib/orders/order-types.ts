import type { CartState } from "@/lib/cart/cart-types";

export type StockShortage = {
  productId: string;
  productName: string;
  requested: number;
  available: number;
};

export type StockValidationResult =
  | { ok: true }
  | { ok: false; shortages: readonly StockShortage[] };

export type OrderRequest = {
  cart: CartState;
};
