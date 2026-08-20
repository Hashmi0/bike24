import "server-only";

import accessories from "../../../data/accessories.json";
import bikes from "../../../data/bikes.json";

import type { Accessory, Bike, Catalog } from "./types";

export async function readCatalogSource(): Promise<Catalog> {
  return {
    bikes: bikes as Bike[],
    accessories: accessories as Accessory[],
  };
}
