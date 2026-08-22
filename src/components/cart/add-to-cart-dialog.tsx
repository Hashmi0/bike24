"use client";

import { useEffect, useRef } from "react";

type AddToCartDialogProps = {
  open: boolean;
  onContinueShopping: () => void;
  onGoToCart: () => void;
  onClose: () => void;
};

export function AddToCartDialog({
  open,
  onContinueShopping,
  onGoToCart,
  onClose,
}: AddToCartDialogProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const continueButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    continueButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
      );

      if (!focusableElements?.length) {
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-950/55 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        ref={dialogRef}
        aria-describedby="add-to-cart-dialog-description"
        aria-labelledby="add-to-cart-dialog-title"
        aria-modal="true"
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">
              Bundle added
            </p>
            <h2
              id="add-to-cart-dialog-title"
              className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950"
            >
              What would you like to do next?
            </h2>
          </div>

          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-xl text-zinc-500 hover:border-zinc-400 hover:text-zinc-950"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <p id="add-to-cart-dialog-description" className="mt-4 text-zinc-600">
          Your bike bundle is ready in the cart.
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button
            ref={continueButtonRef}
            type="button"
            onClick={onContinueShopping}
            className="rounded-full border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-800 hover:border-zinc-950 hover:text-zinc-950"
          >
            Continue shopping
          </button>
          <button
            type="button"
            onClick={onGoToCart}
            className="rounded-full bg-zinc-950 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-700"
          >
            Go to cart
          </button>
        </div>
      </section>
    </div>
  );
}
