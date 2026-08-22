import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BundleConfigurator } from "@/components/configurator/bundle-configurator";
import { getAccessories, getBike, getBikes } from "@/lib/catalog/catalog";
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

export default async function BikeDetailPage({
  params,
}: BikePageProps) {
  const { id } = await params;

  const [bike, accessories] = await Promise.all([
    getBike(id),
    getAccessories(),
  ]);

  if (!bike) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href={siteConfig.routes.bikes}
        className="text-sm font-semibold text-orange-700 hover:text-orange-900"
      >
        ← Back to bikes
      </Link>

      <BundleConfigurator bike={bike} accessories={accessories} />
    </section>
  );
}
