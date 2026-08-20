export type FrameType =
  | "Touring"
  | "Road"
  | "Mountain"
  | "Urban"
  | "E-Cargo"
  | "E-Urban";

export interface Bike {
  id: string;
  name: string;
  frameType: FrameType;
  price: number;
  taxRate: number;
}

export interface Accessory {
  id: string;
  name: string;
  price: number;
  taxRate: number;
  compatibleFrameTypes: readonly FrameType[];
  maxAmount: number;
}

export interface Catalog {
  bikes: readonly Bike[];
  accessories: readonly Accessory[];
}
