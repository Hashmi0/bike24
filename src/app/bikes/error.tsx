"use client";

type BikesErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function BikesError({ reset }: BikesErrorProps) {
  return (
    <section
      role="alert"
      className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6"
    >
      <h1 className="text-3xl font-semibold tracking-tight">
        We could not load the bikes.
      </h1>

      <p className="mt-4 text-zinc-600">
        Please try again. The catalog may be temporarily unavailable.
      </p>

      <button
        type="button"
        onClick={reset}
        className="mt-8 rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700"
      >
        Try again
      </button>
    </section>
  );
}
