import { describe, expect, it } from "vitest";

import type { CartState } from "@/lib/cart/cart-types";
import { StockServiceError, type StockService } from "@/lib/stock/stock-types";

import { createOrderHandler } from "./route";

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
    };
    const response = await createOrderHandler(service)(request({ cart }));
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload.error).toEqual({
      code: "STOCK_UNAVAILABLE",
      message: "We could not verify stock. Please try again.",
    });
  });

  it("rejects an empty or malformed cart", async () => {
    const service: StockService = {
      getAvailability: async () => ({ "bike-001": 1 }),
    };

    const response = await createOrderHandler(service)(request({ cart: { version: 1, bundles: [] } }));
    expect(response.status).toBe(400);
  });
});
