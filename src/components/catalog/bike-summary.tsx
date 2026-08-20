import type { Bike } from "@/lib/catalog/types";

const euroFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});

export function BikeSummary({ bike }: { bike: Bike }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
      <div
        aria-hidden="true"
        className="flex aspect-[16/7] items-center justify-center bg-orange-100 text-sm font-semibold uppercase tracking-[0.2em] text-orange-800"
      >
        <div className="text-[16rem] mb-4">🚲</div>
      </div>

      <div className="space-y-4 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">
          {bike.frameType} bike
        </p>

        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
          {bike.name}
        </h1>

        <div>
          <p className="text-sm text-zinc-500">Net price</p>
          <p className="text-2xl font-semibold text-zinc-950">
            {euroFormatter.format(bike.price)}
          </p>
        </div>
      </div>
    </article>
  );
}
