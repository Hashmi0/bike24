export type StockAvailability = Record<string, number>;

export type StockReservationResult =
  | { ok: true }
  | { ok: false; availability: StockAvailability };

export type StockErrorCode = "UNKNOWN_PRODUCT" | "SERVICE_UNAVAILABLE";

export class StockServiceError extends Error {
  constructor(
    public readonly code: StockErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "StockServiceError";
  }
}

export interface StockService {
  getAvailability(ids: readonly string[]): Promise<StockAvailability>;
  reserveStock(
    required: Readonly<Record<string, number>>,
  ): Promise<StockReservationResult>;
}
