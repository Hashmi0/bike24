import type { Metadata } from "next";

import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your bike bundles.",
};

export default function CartPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">
        Your selection
      </p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">Cart</h1>
      <div className="mt-8">
        <CartView />
      </div>
    </section>
  );
}
