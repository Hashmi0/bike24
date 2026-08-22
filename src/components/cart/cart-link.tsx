"use client";

import Link from "next/link";

import { siteConfig } from "@/config/site";

import { useCart } from "./cart-provider";

export function CartLink() {
  const { bundleCount, isHydrated } = useCart();
  const label = isHydrated && bundleCount > 0 ? `Cart (${bundleCount})` : "Cart";

  return (
    <Link
      className="hover:text-zinc-950"
      href={siteConfig.routes.cart}
      aria-label={label}
    >
      {label}
    </Link>
  );
}
