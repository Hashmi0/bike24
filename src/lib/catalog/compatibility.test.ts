import { describe, expect, it } from "vitest";

import {
  getIncompatibilityReason,
  isAccessoryCompatible,
} from "@/lib/catalog/compatibility";
import type { Accessory, Bike } from "@/lib/catalog/types";

const roadBike: Pick<Bike, "frameType"> = {
  frameType: "Road",
};

const roadAccessory: Pick<Accessory, "compatibleFrameTypes"> = {
  compatibleFrameTypes: ["Road"],
};

const mountainAccessory: Pick<Accessory, "compatibleFrameTypes"> = {
  compatibleFrameTypes: ["Mountain"],
};

describe("accessory compatibility", () => {
  it("accepts an accessory that supports the bike frame type", () => {
    expect(isAccessoryCompatible(roadBike, roadAccessory)).toBe(true);
  });

  it("rejects an accessory for a different frame type", () => {
    expect(isAccessoryCompatible(roadBike, mountainAccessory)).toBe(false);
  });

  it("explains why an accessory cannot be selected", () => {
    expect(getIncompatibilityReason(roadBike)).toBe(
      "Not compatible with Road bikes",
    );
  });
});
