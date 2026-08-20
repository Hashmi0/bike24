import "server-only";

import { readCatalogSource } from "./catalog-source";

export async function getCatalog() {
  return readCatalogSource();
}

export async function getBikes() {
  const { bikes } = await getCatalog();
  return bikes;
}

export async function getBike(id: string) {
  const { bikes } = await getCatalog();
  return bikes.find((bike) => bike.id === id) ?? null;
}

export async function getAccessories() {
  const { accessories } = await getCatalog();
  return accessories;
}
