import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BikeSummary } from "@/components/catalog/bike-summary";
import { getBike, getBikes } from "@/lib/catalog/catalog";
import { siteConfig } from "@/config/site";

export const revalidate = 3600;

type BikePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  const bikes = await getBikes();

  return bikes.map((bike) => ({
    id: bike.id,
  }));
}

export async function generateMetadata({
  params,
}: BikePageProps): Promise<Metadata> {
  const { id } = await params;
  const bike = await getBike(id);

  if (!bike) {
    return {
      title: "Bike not found",
    };
  }

  return {
    title: bike.name,
    description: `${bike.name}, a ${bike.frameType} bike.`,
  };
}

export default async function BikeDetailPage({ params }: BikePageProps) {
  const { id } = await params;
  const bike = await getBike(id);

  if (!bike) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href={siteConfig.routes.bikes}
        className="text-sm font-semibold text-orange-700 hover:text-orange-900"
      >
        ← Back to bikes
      </Link>

      <div className="mt-6">
        <BikeSummary bike={bike} />
      </div>

      <section
        aria-labelledby="accessories-heading"
        className="mt-10 rounded-3xl border border-dashed border-zinc-300 bg-white p-6"
      >
        <h2
          id="accessories-heading"
          className="text-2xl font-semibold tracking-tight"
        >
          Accessories
        </h2>

        <p className="mt-3 text-zinc-600">
          Compatible accessory selection.
        </p>
      </section>
    </section>
  );
}
