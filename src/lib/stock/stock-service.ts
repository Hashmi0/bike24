import {
  StockServiceError,
  type StockAvailability,
  type StockReservationResult,
  type StockService,
} from "./stock-types";

const STOCK_BY_PRODUCT_ID: Readonly<Record<string, number>> = {
  "bike-001": 4,
  "bike-002": 3,
  "bike-003": 2,
  "bike-004": 5,
  "bike-005": 4,
  "bike-006": 1,
  "bike-007": 6,
  "bike-008": 2,
  "bike-009": 1,
  "bike-010": 3,
  "acc-001": 8,
  "acc-002": 5,
  "acc-003": 0,
  "acc-004": 2,
  "acc-005": 6,
  "acc-006": 4,
  "acc-007": 1,
  "acc-008": 3,
  "acc-009": 2,
  "acc-010": 1,
  "acc-011": 1,
  "acc-012": 2,
  "acc-013": 0,
  "acc-014": 1,
  "acc-015": 2,
  "acc-016": 1,
};

const DEFAULT_DELAY_MS = 450;
const DEFAULT_FAILURE_RATE = 0.1;

export type StockServiceOptions = {
  delayMs?: number;
  failureRate?: number;
  random?: () => number;
  sleep?: (delayMs: number) => Promise<void>;
};

const sleep = (delayMs: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, delayMs));

function getDefaultFailureRate() {
  const configuredRate = Number(process.env.STOCK_FAILURE_RATE);

  return Number.isFinite(configuredRate) && configuredRate >= 0 && configuredRate <= 1
    ? configuredRate
    : DEFAULT_FAILURE_RATE;
}

export function createStockService(
  options: StockServiceOptions = {},
): StockService {
  const delayMs = options.delayMs ?? DEFAULT_DELAY_MS;
  const failureRate = options.failureRate ?? getDefaultFailureRate();
  const random = options.random ?? Math.random;
  const wait = options.sleep ?? sleep;
  const inventory = new Map(Object.entries(STOCK_BY_PRODUCT_ID));

  async function prepareRequest(ids: readonly string[]) {
    const uniqueIds = Array.from(new Set(ids));

    if (uniqueIds.length === 0) {
      throw new StockServiceError(
        "UNKNOWN_PRODUCT",
        "At least one product id is required.",
      );
    }

    await wait(delayMs);

    if (random() < failureRate) {
      throw new StockServiceError(
        "SERVICE_UNAVAILABLE",
        "The stock service is temporarily unavailable.",
      );
    }

    const unknownId = uniqueIds.find((id) => !inventory.has(id));

    if (unknownId) {
      throw new StockServiceError(
        "UNKNOWN_PRODUCT",
        `Unknown product id: ${unknownId}`,
      );
    }

    return uniqueIds;
  }

  return {
    async getAvailability(ids) {
      const uniqueIds = await prepareRequest(ids);

      return uniqueIds.reduce<StockAvailability>((availability, id) => {
        availability[id] = inventory.get(id) ?? 0;
        return availability;
      }, {});
    },

    async reserveStock(required): Promise<StockReservationResult> {
      const requiredEntries = Object.entries(required);
      const ids = await prepareRequest(requiredEntries.map(([id]) => id));
      const availability = ids.reduce<StockAvailability>((current, id) => {
        current[id] = inventory.get(id) ?? 0;
        return current;
      }, {});

      const hasShortage = requiredEntries.some(
        ([id, quantity]) => quantity > (availability[id] ?? 0),
      );

      if (hasShortage) {
        return { ok: false, availability };
      }

      for (const [id, quantity] of requiredEntries) {
        inventory.set(id, (availability[id] ?? 0) - quantity);
      }

      return { ok: true };
    },
  };
}

export const stockService = createStockService();
