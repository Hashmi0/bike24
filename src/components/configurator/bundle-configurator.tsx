"use client";

import { useEffect, useMemo, useState } from "react";

import { BikeSummary } from "@/components/catalog/bike-summary";
import {
  getIncompatibilityReason,
  isAccessoryCompatible,
} from "@/lib/catalog/compatibility";
import {
  getBundleAccessoryTotal,
  type BundleDraft,
} from "@/lib/catalog/bundle";
import type { Accessory, Bike } from "@/lib/catalog/types";

import { AccessoryOption } from "./accessory-option";
import { BundleSummary } from "./bundle-summary";

type BundleConfiguratorProps = {
  bike: Bike;
  accessories: readonly Accessory[];
  onDraftChange?: (draft: BundleDraft) => void;
};

export function BundleConfigurator({
  bike,
  accessories,
  onDraftChange,
}: BundleConfiguratorProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(accessories.map((accessory) => [accessory.id, 0])),
  );

  const normalizedQuantities = useMemo(() => {
    return Object.fromEntries(
      accessories.map((accessory) => {
        const compatible = isAccessoryCompatible(bike, accessory);
        const currentQuantity = quantities[accessory.id] ?? 0;

        if (!compatible) {
          return [accessory.id, 0];
        }

        return [
          accessory.id,
          Math.min(Math.max(currentQuantity, 0), accessory.maxAmount),
        ];
      }),
    );
  }, [accessories, bike, quantities]);

  const accessoryTotal = useMemo(
    () => getBundleAccessoryTotal(accessories, normalizedQuantities),
    [accessories, normalizedQuantities],
  );

  const selectedAccessoryCount = Object.values(normalizedQuantities).reduce(
    (total, quantity) => total + quantity,
    0,
  );

  const selectedAccessories = accessories.filter(
    (accessory) => (normalizedQuantities[accessory.id] ?? 0) > 0,
  );

  const bundleNetTotal = bike.price + accessoryTotal;

  useEffect(() => {
    onDraftChange?.({
      bikeId: bike.id,
      accessories: normalizedQuantities,
    });
  }, [bike.id, normalizedQuantities, onDraftChange]);

  function handleQuantityChange(accessory: Accessory, quantity: number) {
    if (!isAccessoryCompatible(bike, accessory)) {
      return;
    }

    const nextQuantity = Math.min(
      Math.max(quantity, 0),
      accessory.maxAmount,
    );

    setQuantities((current) => ({
      ...current,
      [accessory.id]: nextQuantity,
    }));
  }

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <BikeSummary bike={bike} />

      <BundleSummary
        bike={bike}
        selectedAccessories={selectedAccessories}
        quantities={normalizedQuantities}
        selectedAccessoryCount={selectedAccessoryCount}
        bundleNetTotal={bundleNetTotal}
        className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:sticky lg:top-24"
      />

      <section
        aria-labelledby="accessories-heading"
        className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 sm:p-8 lg:col-start-1 lg:row-start-2"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">
            Build your bundle
          </p>

          <h2
            id="accessories-heading"
            className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950"
          >
            Choose accessories for {bike.name}
          </h2>

          <p className="mt-3 max-w-2xl text-zinc-600">
            Incompatible accessories remain visible, but cannot be selected for
            this frame type.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {accessories.map((accessory) => {
            const compatible = isAccessoryCompatible(bike, accessory);

            return (
              <AccessoryOption
                key={accessory.id}
                accessory={accessory}
                compatible={compatible}
                quantity={normalizedQuantities[accessory.id] ?? 0}
                incompatibilityReason={
                  compatible ? undefined : getIncompatibilityReason(bike)
                }
                onQuantityChange={(quantity) =>
                  handleQuantityChange(accessory, quantity)
                }
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
