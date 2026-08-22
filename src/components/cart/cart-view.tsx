"use client";

import Link from "next/link";
import { useState } from "react";

import { siteConfig } from "@/config/site";
import {
  calculateBundlePrice,
  calculateLinePrice,
  formatEUR,
  type PriceBreakdown,
} from "@/lib/cart/pricing";

import { useCart } from "./cart-provider";

export function CartView() {
  const { state, isHydrated, removeBundle, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string>();
  const [shortages, setShortages] = useState<
    Array<{
      productId: string;
      productName: string;
      requested: number;
      available: number;
    }>
  >([]);
  const [orderConfirmation, setOrderConfirmation] = useState<string>();

  const cartPrice = state.bundles.reduce<PriceBreakdown>(
    (total, bundle) => {
      const price = calculateBundlePrice(bundle);
      return {
        netMinor: total.netMinor + price.netMinor,
        taxMinor: total.taxMinor + price.taxMinor,
        grossMinor: total.grossMinor + price.grossMinor,
      };
    },
    { netMinor: 0, taxMinor: 0, grossMinor: 0 },
  );

  async function handlePlaceOrder() {
    setIsSubmitting(true);
    setOrderError(undefined);
    setShortages([]);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ cart: state }),
      });
      const payload = (await response.json()) as {
        orderId?: string;
        error?: {
          message?: string;
          shortages?: Array<{
            productId: string;
            productName: string;
            requested: number;
            available: number;
          }>;
        };
      };

      if (!response.ok) {
        setOrderError(
          payload.error?.message ?? "We could not place your order. Try again.",
        );
        setShortages(payload.error?.shortages ?? []);
        return;
      }

      if (!payload.orderId) {
        setOrderError("The order response was invalid. Please try again.");
        return;
      }

      clearCart();
      setOrderConfirmation(payload.orderId);
    } catch {
      setOrderError(
        "We could not place your order. Check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isHydrated) {
    return <p className="text-zinc-600">Loading your cart…</p>;
  }

  if (orderConfirmation) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Order placed
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
          Thanks for your order
        </h1>
        <p className="mt-3 text-zinc-700">
          Your simulated order number is <strong>{orderConfirmation}</strong>.
        </p>
        <Link
          href={siteConfig.routes.bikes}
          className="mt-7 inline-flex rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  if (state.bundles.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-10 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Your cart is empty</h1>
        <p className="mt-3 text-zinc-600">Build a bike bundle to see it here.</p>
        <Link
          href={siteConfig.routes.bikes}
          className="mt-6 inline-flex rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <div className="space-y-4">
        <h2 className="sr-only">Your cart</h2>
        {state.bundles.map((bundle, index) => {
          const price = calculateBundlePrice(bundle);

          return (
            <article
              key={bundle.id}
              className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
                    Bundle {index + 1}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight">
                    {bundle.bike.name}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => removeBundle(bundle.id)}
                  className="text-sm font-semibold text-zinc-500 underline-offset-4 hover:text-red-700 hover:underline"
                >
                  Remove
                </button>
              </div>

              <ul className="mt-5 space-y-3 border-t border-zinc-100 pt-5 text-sm text-zinc-600">
                <li className="flex justify-between gap-4">
                  <span>{bundle.bike.name} × 1</span>
                  <span>
                    {formatEUR(
                      calculateLinePrice(
                        bundle.bike.price,
                        bundle.bike.taxRate,
                        1,
                      ).netMinor,
                    )}
                  </span>
                </li>
                {bundle.accessories.map((accessory) => (
                  <li key={accessory.id} className="flex justify-between gap-4">
                    <span>
                      {accessory.name} × {accessory.quantity}
                    </span>
                    <span>
                      {formatEUR(
                        calculateLinePrice(
                          accessory.price,
                          accessory.taxRate,
                          accessory.quantity,
                        ).netMinor,
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              <dl className="mt-6 grid gap-2 border-t border-zinc-100 pt-5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-zinc-500">Net</dt>
                  <dd>{formatEUR(price.netMinor)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-zinc-500">Tax</dt>
                  <dd>{formatEUR(price.taxMinor)}</dd>
                </div>
                <div className="flex justify-between gap-4 font-semibold text-zinc-950">
                  <dt>Total</dt>
                  <dd>{formatEUR(price.grossMinor)}</dd>
                </div>
              </dl>
            </article>
          );
        })}
      </div>

      <aside className="rounded-3xl bg-zinc-950 p-6 text-white lg:sticky lg:top-24">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-300">
          Cart summary
        </p>
        <p className="mt-2 text-2xl font-semibold tracking-tight">
          {state.bundles.length} {state.bundles.length === 1 ? "bundle" : "bundles"}
        </p>
        <dl className="mt-6 grid gap-3 border-t border-white/15 pt-5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-400">Net total</dt>
            <dd>{formatEUR(cartPrice.netMinor)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-400">Tax</dt>
            <dd>{formatEUR(cartPrice.taxMinor)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-white/15 pt-3 text-lg font-semibold">
            <dt>Total</dt>
            <dd>{formatEUR(cartPrice.grossMinor)}</dd>
          </div>
        </dl>

        {orderError ? (
          <div
            aria-live="polite"
            className="mt-5 rounded-2xl border border-red-300/40 bg-red-950/40 p-4 text-sm text-red-100"
          >
            <p>{orderError}</p>
            {shortages.length > 0 ? (
              <ul className="mt-3 list-disc space-y-1 pl-5">
                    {shortages.map((shortage) => (
                      <li key={shortage.productId}>
                        {shortage.productName}: requested {shortage.requested}, available {shortage.available}
                      </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
            className="rounded-full bg-orange-500 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-400 disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? "Checking stock…" : "Place order"}
          </button>
          <Link
            href={siteConfig.routes.bikes}
            className="rounded-full bg-white px-4 py-3 text-center text-sm font-semibold text-zinc-950 hover:bg-orange-100"
          >
            Continue shopping
          </Link>
          <button
            type="button"
            onClick={clearCart}
            className="rounded-full border border-white/30 px-4 py-3 text-sm font-semibold text-white hover:border-white"
          >
            Clear cart
          </button>
        </div>
      </aside>
    </div>
  );
}
