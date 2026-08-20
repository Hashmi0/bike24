import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">
        404
      </p>

      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        🧐 Bike not found
      </h1>

      <p className="mt-4 text-zinc-600">
        The bike you are looking for does not exist in the catalog.
      </p>

      <Link
        href="/bikes"
        className="mt-8 inline-flex rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700"
      >
        Return to bikes
      </Link>
    </section>
  );
}
