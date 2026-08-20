"use client";

type BikeDetailErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function BikeDetailError({ reset }: BikeDetailErrorProps) {
  return (
    <section
      role="alert"
      className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6"
    >
      <h1 className="text-3xl font-semibold tracking-tight">
        We could not load this bike.
      </h1>

      <p className="mt-4 text-zinc-600">
        Please try again or return to the bike catalog.
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
