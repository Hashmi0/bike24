import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AddToCartDialog } from "./add-to-cart-dialog";

describe("AddToCartDialog", () => {
  it("stays hidden until opened", () => {
    render(
      <AddToCartDialog
        open={false}
        onClose={vi.fn()}
        onContinueShopping={vi.fn()}
        onGoToCart={vi.fn()}
      />,
    );

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("offers the two next steps and closes on continue shopping", async () => {
    const user = userEvent.setup();
    const onContinueShopping = vi.fn();

    render(
      <AddToCartDialog
        open
        onClose={vi.fn()}
        onContinueShopping={onContinueShopping}
        onGoToCart={vi.fn()}
      />,
    );

    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    await user.click(screen.getByRole("button", { name: "Continue shopping" }));
    expect(onContinueShopping).toHaveBeenCalledOnce();
  });

  it("closes when Escape is pressed", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <AddToCartDialog
        open
        onClose={onClose}
        onContinueShopping={vi.fn()}
        onGoToCart={vi.fn()}
      />,
    );

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("keeps keyboard focus inside the dialog", async () => {
    const user = userEvent.setup();

    render(
      <AddToCartDialog
        open
        onClose={vi.fn()}
        onContinueShopping={vi.fn()}
        onGoToCart={vi.fn()}
      />,
    );

    const continueButton = screen.getByRole("button", {
      name: "Continue shopping",
    });
    await waitFor(() => expect(continueButton).toHaveFocus());

    await user.tab();
    expect(screen.getByRole("button", { name: "Go to cart" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Close dialog" })).toHaveFocus();
    await user.tab();
    expect(continueButton).toHaveFocus();
  });

  it("wraps focus when tabbing backwards", async () => {
    const user = userEvent.setup();

    render(
      <AddToCartDialog
        open
        onClose={vi.fn()}
        onContinueShopping={vi.fn()}
        onGoToCart={vi.fn()}
      />,
    );

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Continue shopping" })).toHaveFocus(),
    );

    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Close dialog" })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Go to cart" })).toHaveFocus();
  });

  it("restores focus to the opener when it closes", async () => {
    const onClose = vi.fn();
    const opener = document.createElement("button");
    opener.type = "button";
    opener.textContent = "Add bundle to cart";
    document.body.append(opener);
    opener.focus();

    const { unmount } = render(
      <AddToCartDialog
        open
        onClose={onClose}
        onContinueShopping={vi.fn()}
        onGoToCart={vi.fn()}
        openerRef={{ current: opener }}
      />,
    );

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Continue shopping" })).toHaveFocus(),
    );

    unmount();
    expect(opener).toHaveFocus();
    expect(onClose).not.toHaveBeenCalled();
    opener.remove();
  });
});
