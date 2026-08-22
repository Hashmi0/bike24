import { describe, expect, it } from "vitest";

import type { CartState } from "@/lib/cart/cart-types";
import { createOrderHandler } from "@/lib/orders/order-handler";
import { createStockService } from "@/lib/stock/stock-service";
import { StockServiceError, type StockService } from "@/lib/stock/stock-types";

const cart: CartState = {
  version: 1,
  bundles: [
    {
      id: "bundle-1",
      bike: {
        id: "bike-001",
        name: "Test Bike",
        frameType: "Road",
        price: 1000,
        taxRate: 0.19,
      },
      accessories: [],
    },
  ],
};

function request(body: unknown) {
  return new Request("http://localhost/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/orders", () => {
  it("creates an order after stock is verified", async () => {
    const service: StockService = {
      getAvailability: async () => ({ "bike-001": 1 }),
      reserveStock: async () => ({ ok: true }),
    };
    const response = await createOrderHandler(service)(request({ cart }));
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(payload.orderId).toEqual(expect.any(String));
  });

  it("returns shortages without creating an order", async () => {
    const service: StockService = {
      getAvailability: async () => ({ "bike-001": 0 }),
      reserveStock: async () => ({
        ok: false,
        availability: { "bike-001": 0 },
      }),
    };
    const response = await createOrderHandler(service)(request({ cart }));
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.error).toMatchObject({ code: "INSUFFICIENT_STOCK" });
    expect(payload.error.shortages).toEqual([
      {
        productId: "bike-001",
        productName: "Test Bike",
        requested: 1,
        available: 0,
      },
    ]);
  });

  it("returns a retryable error when stock is unavailable", async () => {
    const service: StockService = {
      getAvailability: async () => {
        throw new StockServiceError("SERVICE_UNAVAILABLE", "down");
      },
      reserveStock: async () => {
        throw new StockServiceError("SERVICE_UNAVAILABLE", "down");
      },
    };
    const response = await createOrderHandler(service)(request({ cart }));
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload.error).toEqual({
      code: "STOCK_UNAVAILABLE",
      message: "We’re having trouble checking availability. Please try again.",
    });
  });

  it("rejects an empty or malformed cart", async () => {
    const service: StockService = {
      getAvailability: async () => ({ "bike-001": 1 }),
      reserveStock: async () => ({ ok: true }),
    };

    const response = await createOrderHandler(service)(request({ cart: { version: 1, bundles: [] } }));
    expect(response.status).toBe(400);
  });

  it("allows only one concurrent order to reserve the same inventory", async () => {
    const service = createStockService({
      delayMs: 0,
      failureRate: 0,
      sleep: async () => undefined,
    });
    const handler = createOrderHandler(service);
    const raceCart: CartState = {
      version: 1,
      bundles: [
        {
          ...cart.bundles[0],
          id: "bundle-1",
          bike: {
            ...cart.bundles[0].bike,
            id: "bike-003",
            name: "Race Bike",
          },
        },
        {
          ...cart.bundles[0],
          id: "bundle-2",
          bike: {
            ...cart.bundles[0].bike,
            id: "bike-003",
            name: "Race Bike",
          },
        },
      ],
    };

    const responses = await Promise.all([
      handler(request({ cart: raceCart })),
      handler(request({ cart: raceCart })),
    ]);
    const statuses = responses.map((response) => response.status).sort();

    expect(statuses).toEqual([201, 409]);
  });
});
