import Link from "next/link";

import type { Bike } from "@/lib/catalog/types";

const euroFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});

export function BikeCard({ bike }: { bike: Bike }) {
  return (
    <li className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
      <div
        aria-hidden="true"
        className="flex aspect-[4/3] items-center justify-center bg-orange-100 text-sm font-semibold uppercase tracking-[0.2em] text-orange-800"
      >
        <div  className="text-9xl mb-4">🚲</div>
      </div>

      <div className="space-y-4 p-5">
        <p className="text-sm font-medium text-orange-700">
          {bike.frameType} bike
        </p>

        <div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
            <Link className="hover:text-orange-700" href={`/bikes/${bike.id}`}>
              {bike.name}
            </Link>
          </h2>

          <p className="mt-3 text-sm text-zinc-500">Net price</p>
          <p className="text-lg font-semibold text-zinc-950">
            {euroFormatter.format(bike.price)}
          </p>
        </div>

        <Link
          className="inline-flex rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
          href={`/bikes/${bike.id}`}
        >
          Configure bike
        </Link>
      </div>
    </li>
  );
}
