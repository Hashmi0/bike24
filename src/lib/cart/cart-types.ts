import type { Accessory, Bike } from "@/lib/catalog/types";

export type CartAccessory = Pick<
  Accessory,
  "id" | "name" | "price" | "taxRate"
> & {
  quantity: number;
};

export type CartBundle = {
  id: string;
  bike: Bike;
  accessories: readonly CartAccessory[];
};

export type CartState = {
  version: 1;
  bundles: readonly CartBundle[];
};

export const EMPTY_CART: CartState = {
  version: 1,
  bundles: [],
};
