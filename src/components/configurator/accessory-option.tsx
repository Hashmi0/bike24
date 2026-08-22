"use client";

import type { Accessory } from "@/lib/catalog/types";
import type { CSSProperties } from "react";

type AccessoryOptionProps = {
  accessory: Accessory;
  compatible: boolean;
  quantity: number;
  maxQuantity: number;
  availableStock?: number;
  isLoading?: boolean;
  incompatibilityReason?: string;
  disabledReason?: string;
  onQuantityChange: (quantity: number) => void;
};

const euroFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});

export function AccessoryOption({
  accessory,
  compatible,
  quantity,
  maxQuantity,
  availableStock,
  isLoading = false,
  incompatibilityReason,
  disabledReason,
  onQuantityChange,
}: AccessoryOptionProps) {
  const inputId = `accessory-${accessory.id}`;
  const reasonId = `${inputId}-reason`;
  const progress = maxQuantity
    ? (quantity / maxQuantity) * 100
    : 0;
  const disabled = !compatible || isLoading || maxQuantity === 0;

  return (
    <article
      className={`rounded-2xl border p-5 transition-colors ${
        compatible
          ? "border-zinc-200 bg-white"
          : "border-zinc-200 bg-zinc-100 opacity-70"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-zinc-950">{accessory.name}</h3>

          <p className="mt-1 text-sm text-zinc-600">
            {euroFormatter.format(accessory.price)}
          </p>
        </div>

        <span className="text-sm font-medium text-zinc-500">
          Max {maxQuantity}
        </span>
      </div>

      {!compatible ? (
        <p id={reasonId} className="mt-4 text-sm font-medium text-red-700">
          {incompatibilityReason}
        </p>
      ) : disabledReason ? (
        <p id={reasonId} className="mt-4 text-sm font-medium text-red-700">
          {disabledReason}
        </p>
      ) : null}

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-zinc-800"
          >
            Quantity
          </label>

          <output
            htmlFor={inputId}
            aria-live="polite"
            className="font-semibold text-zinc-950"
          >
            {quantity}
          </output>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            disabled={disabled || quantity === 0}
            aria-label={`Decrease quantity of ${accessory.name}`}
            aria-controls={inputId}
            onClick={() => onQuantityChange(quantity - 1)}
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-white text-xl font-medium text-zinc-800 shadow-sm transition hover:border-orange-700 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span aria-hidden="true">−</span>
          </button>

          <input
            id={inputId}
            type="range"
            min={0}
            max={maxQuantity}
            step={1}
            value={compatible ? quantity : 0}
            disabled={disabled}
            aria-valuetext={`${quantity} of ${maxQuantity}`}
            aria-describedby={!compatible || disabledReason ? reasonId : undefined}
            aria-label={`Quantity for ${accessory.name}`}
            onChange={(event) => onQuantityChange(Number(event.target.value))}
            style={{ "--range-progress": `${progress}%` } as CSSProperties}
            className="quantity-range"
          />

          <button
            type="button"
            disabled={disabled || quantity === maxQuantity}
            aria-label={`Increase quantity of ${accessory.name}`}
            aria-controls={inputId}
            onClick={() => onQuantityChange(quantity + 1)}
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-white text-xl font-medium text-zinc-800 shadow-sm transition hover:border-orange-700 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span aria-hidden="true">+</span>
          </button>
        </div>

        <div className="mt-2 flex justify-between text-xs text-zinc-500">
          <span>0</span>
          <span>{maxQuantity} per bundle</span>
        </div>

        <p className="mt-3 text-xs text-zinc-500">
          {isLoading
            ? "Checking availability…"
            : availableStock !== undefined
              ? `${availableStock} in stock`
              : "Stock unavailable"}
        </p>
      </div>
    </article>
  );
}
