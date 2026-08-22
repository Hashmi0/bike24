import Link from "next/link";

import { CartLink } from "@/components/cart/cart-link";
import { siteConfig } from "@/config/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          className="font-semibold tracking-tight text-zinc-950"
          href={siteConfig.routes.bikes}
        >
          {siteConfig.name}
        </Link>
        <nav aria-label="Primary navigation">
          <ul className="flex items-center gap-6 text-sm font-medium text-zinc-700">
            <li>
              <Link className="hover:text-zinc-950" href={siteConfig.routes.bikes}>
                Bikes
              </Link>
            </li>
            <li>
              <CartLink />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
