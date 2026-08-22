import { NextResponse } from "next/server";

import { StockServiceError, type StockService } from "@/lib/stock/stock-types";

import {
  getOrderProductIds,
  isCartState,
  validateStock,
} from "./order-validation";

function responseBody(
  requestId: string,
  status: number,
  body: Record<string, unknown>,
) {
  return NextResponse.json({ requestId, ...body }, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export function createOrderHandler(service: StockService) {
  return async function POST(request: Request) {
    const requestId = crypto.randomUUID();
    let payload: unknown;

    try {
      payload = await request.json();
    } catch {
      return responseBody(requestId, 400, {
        error: {
          code: "INVALID_CART",
          message: "The cart payload is invalid.",
        },
      });
    }

    const cart =
      payload && typeof payload === "object" && "cart" in payload
        ? payload.cart
        : undefined;

    if (!isCartState(cart) || cart.bundles.length === 0) {
      return responseBody(requestId, 400, {
        error: {
          code: "INVALID_CART",
          message: "Add at least one bundle before placing an order.",
        },
      });
    }

    try {
      const availability = await service.getAvailability(getOrderProductIds(cart));
      const validation = validateStock(cart, availability);

      if (!validation.ok) {
        return responseBody(requestId, 409, {
          error: {
            code: "INSUFFICIENT_STOCK",
            message: "Some items are no longer available in the requested quantity.",
            shortages: validation.shortages,
          },
        });
      }

      return responseBody(requestId, 201, {
        orderId: crypto.randomUUID(),
      });
    } catch (error) {
      if (error instanceof StockServiceError) {
        return responseBody(requestId, 503, {
          error: {
            code: "STOCK_UNAVAILABLE",
            message: "We’re having trouble checking availability. Please try again.",
          },
        });
      }

      return responseBody(requestId, 503, {
        error: {
          code: "STOCK_UNAVAILABLE",
          message: "We’re having trouble checking availability. Please try again.",
        },
      });
    }
  };
}
