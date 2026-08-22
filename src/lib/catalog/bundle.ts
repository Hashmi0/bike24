  import type { Accessory } from "./types";

  export interface BundleDraft {
    bikeId: string;
    accessories: Record<string, number>;
  }

  export function getBundleAccessoryTotal(
    accessories: readonly Accessory[],
    quantities: Record<string, number>,
  ) {
    return accessories.reduce(
      (total, accessory) =>
        total + accessory.price * (quantities[accessory.id] ?? 0),
      0,
    );
  }