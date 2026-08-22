import type { Accessory, Bike } from "./types";

export function isAccessoryCompatible(
  bike: Pick<Bike, "frameType">,
  accessory: Pick<Accessory, "compatibleFrameTypes">,
) {
  return accessory.compatibleFrameTypes.includes(bike.frameType);
}

export function getIncompatibilityReason(bike: Pick<Bike, "frameType">) {
  return `Not compatible with ${bike.frameType} bikes`;
}
