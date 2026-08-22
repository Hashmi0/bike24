import type { CartBundle } from "./cart-types";

export type PriceBreakdown = {
  netMinor: number;
  taxMinor: number;
  grossMinor: number;
};

export function toMinorUnits(amount: number) {
  return Math.round(amount * 100);
}

export function calculateLinePrice(
  price: number,
  taxRate: number,
  quantity: number,
): PriceBreakdown {
  const netMinor = toMinorUnits(price) * quantity;
  const taxMinor = Math.round(netMinor * taxRate);

  return {
    netMinor,
    taxMinor,
    grossMinor: netMinor + taxMinor,
  };
}

export function calculateBundlePrice(bundle: CartBundle): PriceBreakdown {
  return [
    calculateLinePrice(bundle.bike.price, bundle.bike.taxRate, 1),
    ...bundle.accessories.map((accessory) =>
      calculateLinePrice(accessory.price, accessory.taxRate, accessory.quantity),
    ),
  ].reduce(
    (total, line) => ({
      netMinor: total.netMinor + line.netMinor,
      taxMinor: total.taxMinor + line.taxMinor,
      grossMinor: total.grossMinor + line.grossMinor,
    }),
    { netMinor: 0, taxMinor: 0, grossMinor: 0 },
  );
}

export function formatEUR(minorUnits: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(minorUnits / 100);
}
