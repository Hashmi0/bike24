 import { BikeGrid } from "@/components/catalog/bike-grid";
  import { getBikes } from "@/lib/catalog/catalog";

  export const revalidate = 3600;

  export default async function BikesPage() {
    const bikes = await getBikes();

    return (
      <section
        aria-labelledby="bikes-heading"
        className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
      >
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">
            Bike bundle configurator
          </p>

          <h1
            id="bikes-heading"
            className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl"
          >
            Choose the bike that starts your build.
          </h1>

          <p className="mt-4 text-lg leading-8 text-zinc-600">
            Compare the supplied bikes and configure compatible accessories for
            your selected frame.
          </p>
        </div>

        <BikeGrid bikes={bikes} />
      </section>
    );
  }