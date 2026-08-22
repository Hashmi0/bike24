"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { BikeSummary } from "@/components/catalog/bike-summary";
import { AddToCartDialog } from "@/components/cart/add-to-cart-dialog";
import { useCart } from "@/components/cart/cart-provider";
import { siteConfig } from "@/config/site";
import { useStockAvailability } from "@/hooks/use-stock-availability";
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const { addBundle } = useCart();
  const stockIds = useMemo(
    () => [bike.id, ...accessories.map((accessory) => accessory.id)],
    [accessories, bike.id],
  );
  const stock = useStockAvailability(stockIds);
  const bikeStock = stock.availability[bike.id];
  const stockReady = stock.status === "success";

  const normalizedQuantities = useMemo(() => {
    return Object.fromEntries(
      accessories.map((accessory) => {
        const compatible = isAccessoryCompatible(bike, accessory);
        const currentQuantity = quantities[accessory.id] ?? 0;

        if (!compatible) {
          return [accessory.id, 0];
        }

        const available = stock.availability[accessory.id] ?? 0;
        const maxQuantity = stockReady
          ? Math.min(accessory.maxAmount, available)
          : 0;

        return [
          accessory.id,
          Math.min(Math.max(currentQuantity, 0), maxQuantity),
        ];
      }),
    );
  }, [accessories, bike, quantities, stock.availability, stockReady]);

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
  const canAddToCart = stockReady && (bikeStock ?? 0) > 0;
  const bikeUnavailable = stockReady && (bikeStock ?? 0) === 0;

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

    const available = stock.availability[accessory.id] ?? 0;
    const maxQuantity = Math.min(accessory.maxAmount, available);
    const nextQuantity = Math.min(Math.max(quantity, 0), maxQuantity);

    setQuantities((current) => ({
      ...current,
      [accessory.id]: nextQuantity,
    }));
  }

  function handleAddToCart() {
    if (!canAddToCart) {
      return;
    }

    addBundle({
      bike,
      accessories: selectedAccessories.map((accessory) => ({
        id: accessory.id,
        name: accessory.name,
        price: accessory.price,
        taxRate: accessory.taxRate,
        quantity: normalizedQuantities[accessory.id] ?? 0,
      })),
    });
    setAnnouncement("Bundle added to cart.");
    setIsAddDialogOpen(true);
  }

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <BikeSummary
        bike={bike}
        availability={{
          status: stock.status === "idle" ? "loading" : stock.status,
          available: bikeStock,
          message: stock.status === "error" ? stock.message : undefined,
        }}
      />

      <BundleSummary
        bike={bike}
        selectedAccessories={selectedAccessories}
        quantities={normalizedQuantities}
        selectedAccessoryCount={selectedAccessoryCount}
        bundleNetTotal={bundleNetTotal}
        onAddToCart={handleAddToCart}
        addDisabled={!canAddToCart}
        addButtonRef={addButtonRef}
        addHelpText={
          bikeUnavailable
            ? "This bike is out of stock. Choose another bike to continue."
            : undefined
        }
        addLabel={
          stock.status === "loading"
            ? "Checking availability…"
            : stock.status === "error"
              ? "Stock unavailable"
              : bikeUnavailable
                ? "Bike unavailable"
              : "Add bundle to cart"
        }
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

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            {stock.status === "error" ? (
              <>
                <p className="font-medium text-red-700">{stock.message}</p>
                <button
                  type="button"
                  onClick={stock.retry}
                  className="font-semibold text-orange-700 underline-offset-4 hover:underline"
                >
                  Try again
                </button>
              </>
            ) : stock.status === "loading" ? (
              <p className="text-zinc-500">Checking live stock…</p>
            ) : (
              <p className="text-emerald-700">Stock checked just now.</p>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {accessories.map((accessory) => {
            const compatible = isAccessoryCompatible(bike, accessory);
            const availableStock = stock.availability[accessory.id];
            const maxQuantity = stockReady
              ? Math.min(accessory.maxAmount, availableStock ?? 0)
              : 0;

            return (
              <AccessoryOption
                key={accessory.id}
                accessory={accessory}
                compatible={compatible}
                quantity={normalizedQuantities[accessory.id] ?? 0}
                maxQuantity={maxQuantity}
                availableStock={availableStock}
                isLoading={stock.status === "loading"}
                incompatibilityReason={
                  compatible ? undefined : getIncompatibilityReason(bike)
                }
                disabledReason={
                  compatible && stock.status === "error"
                    ? "We’re having trouble checking availability. Please try again."
                    : compatible && stockReady && maxQuantity === 0
                      ? "Currently out of stock."
                      : undefined
                }
                onQuantityChange={(quantity) =>
                  handleQuantityChange(accessory, quantity)
                }
              />
            );
          })}
        </div>
      </section>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      <AddToCartDialog
        open={isAddDialogOpen}
        openerRef={addButtonRef}
        onClose={() => setIsAddDialogOpen(false)}
        onContinueShopping={() => setIsAddDialogOpen(false)}
        onGoToCart={() => router.push(siteConfig.routes.cart)}
      />
    </div>
  );
}
