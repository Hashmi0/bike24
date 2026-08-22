import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import { CartProvider } from "@/components/cart/cart-provider";
import { BundleConfigurator } from "@/components/configurator/bundle-configurator";
import type { BundleDraft } from "@/lib/catalog/bundle";
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
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function renderConfigurator(onDraftChange?: (draft: BundleDraft) => void) {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string) => {
        const ids = new URL(input, "http://localhost").searchParams
          .get("ids")
          ?.split(",")
          .filter(Boolean);

        return {
          ok: true,
          json: async () => ({
            requestId: "test-request",
            items: ids?.map((id) => ({ id, available: 5 })) ?? [],
          }),
        };
      }),
    );

    return render(
      <CartProvider>
        <BundleConfigurator
          bike={roadBike}
          accessories={[roadAccessory, mountainAccessory]}
          onDraftChange={onDraftChange}
        />
      </CartProvider>,
    );
  }

  it("keeps incompatible accessories visible but not selectable", async () => {
    renderConfigurator();

    await waitFor(() =>
      expect(
        screen.getByRole("slider", {
          name: `Quantity for ${roadAccessory.name}`,
        }),
      ).toBeEnabled(),
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

    renderConfigurator(onDraftChange);

    await waitFor(() =>
      expect(
        screen.getByRole("button", {
          name: `Increase quantity of ${roadAccessory.name}`,
        }),
      ).toBeEnabled(),
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
    renderConfigurator();

    expect(screen.queryByText("No accessories selected yet.")).toBeNull();
    expect(screen.queryByText("0 accessories selected")).toBeNull();
  });
});
