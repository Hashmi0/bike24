import { describe, expect, it, vi } from "vitest";

import { createStockService } from "./stock-service";
import { StockServiceError } from "./stock-types";

describe("stock service", () => {
  const serviceOptions = {
    delayMs: 450,
    failureRate: 0,
    sleep: vi.fn(async () => undefined),
  };

  it("returns deterministic availability and preserves request order", async () => {
    const service = createStockService(serviceOptions);

    await expect(
      service.getAvailability(["acc-004", "bike-001", "acc-004"]),
    ).resolves.toEqual({ "acc-004": 2, "bike-001": 4 });
    expect(serviceOptions.sleep).toHaveBeenCalledWith(450);
  });

  it("simulates a service failure", async () => {
    const service = createStockService({
      ...serviceOptions,
      failureRate: 1,
      random: () => 0.5,
    });

    await expect(service.getAvailability(["bike-001"])).rejects.toMatchObject({
      code: "SERVICE_UNAVAILABLE",
    });
  });

  it("rejects unknown and empty product ids", async () => {
    const service = createStockService(serviceOptions);

    await expect(service.getAvailability([])).rejects.toBeInstanceOf(
      StockServiceError,
    );
    await expect(service.getAvailability(["missing"])).rejects.toMatchObject({
      code: "UNKNOWN_PRODUCT",
    });
  });

  it("decrements stock only when the full reservation can succeed", async () => {
    const service = createStockService({
      ...serviceOptions,
      sleep: async () => undefined,
    });

    await expect(service.reserveStock({ "acc-004": 1 })).resolves.toEqual({
      ok: true,
    });
    await expect(service.getAvailability(["acc-004"])).resolves.toEqual({
      "acc-004": 1,
    });

    await expect(service.reserveStock({ "acc-004": 2 })).resolves.toEqual({
      ok: false,
      availability: { "acc-004": 1 },
    });
    await expect(service.getAvailability(["acc-004"])).resolves.toEqual({
      "acc-004": 1,
    });
  });
});
