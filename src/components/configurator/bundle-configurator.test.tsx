import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { BundleConfigurator } from "@/components/configurator/bundle-configurator";
import type { Accessory, Bike } from "@/lib/catalog/types";

const roadBike: Bike = {
  id: "bike-test-road",
  name: "Test Road Bike",
  frameType: "Road",
  price: 1000,
  taxRate: 0.19,
};

const roadAccessory: Accessory = {
  id: "acc-test-road",
  name: "Road Bottle Cage",
  price: 20,
  taxRate: 0.19,
  compatibleFrameTypes: ["Road"],
  maxAmount: 2,
};

const mountainAccessory: Accessory = {
  id: "acc-test-mountain",
  name: "Mountain Protective Gear",
  price: 50,
  taxRate: 0.19,
  compatibleFrameTypes: ["Mountain"],
  maxAmount: 1,
};

describe("BundleConfigurator", () => {
  it("keeps incompatible accessories visible but not selectable", () => {
    render(
      <BundleConfigurator
        bike={roadBike}
        accessories={[roadAccessory, mountainAccessory]}
      />,
    );

    expect(screen.getByText(roadAccessory.name)).toBeVisible();
    expect(screen.getByText(mountainAccessory.name)).toBeVisible();

    expect(
      screen.getByRole("slider", {
        name: `Quantity for ${roadAccessory.name}`,
      }),
    ).toBeEnabled();

    expect(
      screen.getByRole("slider", {
        name: `Quantity for ${mountainAccessory.name}`,
      }),
    ).toBeDisabled();

    expect(
      screen.getByText("Not compatible with Road bikes"),
    ).toBeVisible();
  });

  it("updates the quantity and bundle summary through the plus control", async () => {
    const user = userEvent.setup();
    const onDraftChange = vi.fn();

    render(
      <BundleConfigurator
        bike={roadBike}
        accessories={[roadAccessory, mountainAccessory]}
        onDraftChange={onDraftChange}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: `Increase quantity of ${roadAccessory.name}`,
      }),
    );

    expect(
      screen.getByRole("slider", {
        name: `Quantity for ${roadAccessory.name}`,
      }),
    ).toHaveValue("1");
    expect(screen.getByText("1 accessory selected")).toBeVisible();
    expect(
      within(screen.getByRole("complementary")).getByText(
        roadAccessory.name,
      ),
    ).toBeVisible();
    expect(onDraftChange).toHaveBeenLastCalledWith({
      bikeId: roadBike.id,
      accessories: {
        [roadAccessory.id]: 1,
        [mountainAccessory.id]: 0,
      },
    });
  });

  it("does not show empty accessory messaging before a selection", () => {
    render(
      <BundleConfigurator
        bike={roadBike}
        accessories={[roadAccessory, mountainAccessory]}
      />,
    );

    expect(screen.queryByText("No accessories selected yet.")).toBeNull();
    expect(screen.queryByText("0 accessories selected")).toBeNull();
  });
});
