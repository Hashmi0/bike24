"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { StockAvailability } from "@/lib/stock/stock-types";

type StockRequestState =
  | { status: "idle" | "loading"; availability: StockAvailability }
  | {
      status: "success";
      availability: StockAvailability;
      requestId: string;
    }
  | {
      status: "error";
      availability: StockAvailability;
      message: string;
    };

type StockResponse = {
  requestId?: string;
  items?: Array<{ id: string; available: number }>;
  error?: { message?: string };
};

export function useStockAvailability(ids: readonly string[]) {
  const requestKey = useMemo(
    () => Array.from(new Set(ids)).filter(Boolean).join(","),
    [ids],
  );
  const [retryCount, setRetryCount] = useState(0);
  const [state, setState] = useState<StockRequestState>({
    status: requestKey ? "loading" : "idle",
    availability: {},
  });

  useEffect(() => {
    if (!requestKey) {
      queueMicrotask(() => setState({ status: "idle", availability: {} }));
      return;
    }

    const controller = new AbortController();
    queueMicrotask(() => {
      if (!controller.signal.aborted) {
        setState((current) => ({
          status: "loading",
          availability: current.availability,
        }));
      }
    });

    fetch(`/api/stock?ids=${encodeURIComponent(requestKey)}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = (await response.json()) as StockResponse;

        if (!response.ok) {
          throw new Error(payload.error?.message ?? "Could not load stock.");
        }

        if (!payload.requestId || !payload.items) {
          throw new Error("Stock response was invalid.");
        }

        return payload;
      })
      .then((payload) => {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          status: "success",
          availability: Object.fromEntries(
            payload.items!.map((item) => [item.id, item.available]),
          ),
          requestId: payload.requestId!,
        });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setState((current) => ({
          status: "error",
          availability: current.availability,
          message:
            error instanceof Error ? error.message : "Could not load stock.",
        }));
      });

    return () => controller.abort();
  }, [requestKey, retryCount]);

  const retry = useCallback(() => setRetryCount((count) => count + 1), []);

  return { ...state, retry };
}
