import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { GET } from "./route";

describe("GET /api/stock", () => {
  it("rejects requests without product ids and disables caching", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/stock"),
    );
    const payload = (await response.json()) as {
      error: { code: string; message: string };
      requestId: string;
    };

    expect(response.status).toBe(400);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(payload.error).toEqual({
      code: "INVALID_REQUEST",
      message: "Provide at least one product id.",
    });
    expect(payload.requestId).toEqual(expect.any(String));
  });
});
