import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { stockService } from "@/lib/stock/stock-service";
import { StockServiceError } from "@/lib/stock/stock-types";

export const dynamic = "force-dynamic";

function responseHeaders() {
  return { "Cache-Control": "no-store" };
}

function errorResponse(
  requestId: string,
  status: number,
  code: string,
  message: string,
) {
  return NextResponse.json(
    { requestId, error: { code, message } },
    { status, headers: responseHeaders() },
  );
}

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const ids = Array.from(
    new Set(
      (request.nextUrl.searchParams.get("ids") ?? "")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  );

  if (ids.length === 0) {
    return errorResponse(
      requestId,
      400,
      "INVALID_REQUEST",
      "Provide at least one product id.",
    );
  }

  try {
    const availability = await stockService.getAvailability(ids);

    return NextResponse.json(
      {
        requestId,
        items: ids.map((id) => ({ id, available: availability[id] })),
      },
      { headers: responseHeaders() },
    );
  } catch (error) {
    if (error instanceof StockServiceError) {
      if (error.code === "UNKNOWN_PRODUCT") {
        return errorResponse(
          requestId,
          400,
          error.code,
          "One or more products are unknown.",
        );
      }

      return errorResponse(
        requestId,
        503,
        error.code,
        "Stock is temporarily unavailable.",
      );
    }

    return errorResponse(
      requestId,
      503,
      "SERVICE_UNAVAILABLE",
      "Stock is temporarily unavailable.",
    );
  }
}
