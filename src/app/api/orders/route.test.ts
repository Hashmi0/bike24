import { describe, expect, it, vi } from "vitest";

import type { CartState } from "@/lib/cart/cart-types";
import type { Catalog } from "@/lib/catalog/types";
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

const catalog: Catalog = {
  bikes: [
    cart.bundles[0].bike,
    { ...cart.bundles[0].bike, id: "bike-003", name: "Race Bike" },
  ],
  accessories: [
    {
      id: "acc-001",
      name: "Test Helmet",
      price: 20,
      taxRate: 0.19,
      compatibleFrameTypes: ["Road"],
      maxAmount: 4,
    },
    {
      id: "acc-002",
      name: "Mountain Gear",
      price: 25,
      taxRate: 0.19,
      compatibleFrameTypes: ["Mountain"],
      maxAmount: 2,
    },
  ],
};

const loadCatalog = async () => catalog;

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
    const response = await createOrderHandler(service, loadCatalog)(request({ cart }));
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
    const response = await createOrderHandler(service, loadCatalog)(request({ cart }));
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
    const response = await createOrderHandler(service, loadCatalog)(request({ cart }));
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

    const response = await createOrderHandler(service, loadCatalog)(request({ cart: { version: 1, bundles: [] } }));
    expect(response.status).toBe(400);
  });

  it("allows only one concurrent order to reserve the same inventory", async () => {
    const service = createStockService({
      delayMs: 0,
      failureRate: 0,
      sleep: async () => undefined,
    });
    const handler = createOrderHandler(service, loadCatalog);
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

  it("rejects catalog-invalid carts before reserving stock", async () => {
    const reserveStock = vi.fn(async () => ({ ok: true as const }));
    const service: StockService = {
      getAvailability: async () => ({}),
      reserveStock,
    };
    const invalidCart: CartState = {
      ...cart,
      bundles: [
        {
          ...cart.bundles[0],
          accessories: [
            {
              id: "acc-001",
              name: "Test Helmet",
              price: 20,
              taxRate: 0.19,
              quantity: 5,
            },
          ],
        },
      ],
    };

    const response = await createOrderHandler(service, loadCatalog)(
      request({ cart: invalidCart }),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toMatchObject({ code: "INVALID_CART" });
    expect(reserveStock).not.toHaveBeenCalled();
  });

  it("maps unknown stock products to an invalid-cart response", async () => {
    const service: StockService = {
      getAvailability: async () => ({}),
      reserveStock: async () => {
        throw new StockServiceError("UNKNOWN_PRODUCT", "unknown");
      },
    };

    const response = await createOrderHandler(
      service,
      async () => ({ bikes: catalog.bikes, accessories: [] }),
    )(request({ cart }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toEqual({
      code: "INVALID_CART",
      message: "The cart contains an unknown product.",
    });
  });
});
