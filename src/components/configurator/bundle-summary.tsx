import type { Accessory, Bike } from "@/lib/catalog/types";

type BundleSummaryProps = {
  bike: Bike;
  selectedAccessories: readonly Accessory[];
  quantities: Record<string, number>;
  selectedAccessoryCount: number;
  bundleNetTotal: number;
  className?: string;
  onAddToCart?: () => void;
  addDisabled?: boolean;
  addLabel?: string;
};

const euroFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});

export function BundleSummary({
  bike,
  selectedAccessories,
  quantities,
  selectedAccessoryCount,
  bundleNetTotal,
  className,
  onAddToCart,
  addDisabled = false,
  addLabel = "Add bundle to cart",
}: BundleSummaryProps) {
  const hasAccessories = selectedAccessories.length > 0;

  return (
    <aside
      aria-labelledby="bundle-summary-heading"
      className={`rounded-2xl bg-zinc-950 p-5 text-white ${className ?? ""}`}
    >
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-300">
        Bundle summary
      </p>

      <h2
        id="bundle-summary-heading"
        className="mt-2 text-2xl font-semibold tracking-tight"
      >
        Your bundle
      </h2>

      <dl className="mt-6 space-y-4 text-sm">
        <div
          className={`flex items-start justify-between gap-4 ${
            hasAccessories ? "border-b border-white/15 pb-4" : ""
          }`}
        >
          <dt className="text-zinc-300">
            {bike.name}
            <span className="block text-xs text-zinc-500">Bike × 1</span>
          </dt>
          <dd className="shrink-0 font-medium">
            {euroFormatter.format(bike.price)}
          </dd>
        </div>

        {hasAccessories ? (
          selectedAccessories.map((accessory) => (
            <div
              key={accessory.id}
              className="flex items-start justify-between gap-4"
            >
              <dt className="text-zinc-300">
                {accessory.name}
                <span className="block text-xs text-zinc-500">
                  Accessory × {quantities[accessory.id]}
                </span>
              </dt>
              <dd className="shrink-0 font-medium">
                {euroFormatter.format(
                  accessory.price * (quantities[accessory.id] ?? 0),
                )}
              </dd>
            </div>
          ))
        ) : null}
      </dl>

      <div
        aria-live="polite"
        className={`mt-6 pt-5 ${
          hasAccessories ? "border-t border-white/20" : ""
        }`}
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-400">Bundle net total</p>
            {hasAccessories ? (
              <p className="mt-1 text-xs text-zinc-500">
                {selectedAccessoryCount}{" "}
                {selectedAccessoryCount === 1 ? "accessory" : "accessories"}{" "}
                selected
              </p>
            ) : null}
          </div>

          <p className="text-2xl font-semibold">
            {euroFormatter.format(bundleNetTotal)}
          </p>
        </div>
      </div>

      {onAddToCart ? (
        <div className="mt-6">
          <button
            type="button"
            disabled={addDisabled}
            onClick={onAddToCart}
            className="w-full rounded-full bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
          >
            {addLabel}
          </button>
        </div>
      ) : null}
    </aside>
  );
}
