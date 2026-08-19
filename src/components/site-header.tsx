import Link from "next/link";

import { siteConfig } from "@/config/site";

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white">
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
              <Link className="hover:text-zinc-950" href={siteConfig.routes.cart}>
                Cart
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
