import type { Bike } from "@/lib/catalog/types";

import { BikeCard } from "./bike-card";

export function BikeGrid({ bikes }: { bikes: readonly Bike[] }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {bikes.map((bike) => (
        <BikeCard key={bike.id} bike={bike} />
      ))}
    </ul>
  );
}
