import { describe, it, expect, vi } from "vitest";
import { render } from "../../../test/helpers";
import { Button } from "./button";

describe("Button", () => {
  it("renderuje się z poprawną treścią", () => {
    const { getByRole } = render(<Button>Kliknij mnie</Button>);

    expect(getByRole("button", { name: /kliknij mnie/i })).toBeTruthy();
  });

  it("wywołuje onClick po kliknięciu", async () => {
    const handleClick = vi.fn();
    const { getByRole, user } = render(<Button onClick={handleClick}>Kliknij mnie</Button>);

    const button = getByRole("button", { name: /kliknij mnie/i });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("jest wyłączony gdy ma atrybut disabled", () => {
    const { getByRole } = render(<Button disabled>Kliknij mnie</Button>);

    const button = getByRole("button", { name: /kliknij mnie/i });
    expect(button).toHaveAttribute("disabled");
  });

  it("obsługuje różne warianty", () => {
    const { getByRole, rerender } = render(<Button variant="destructive">Destructive</Button>);
    let button = getByRole("button", { name: /destructive/i });
    expect(button.className).toContain("bg-destructive");

    rerender(<Button variant="outline">Outline</Button>);
    button = getByRole("button", { name: /outline/i });
    expect(button.className).toContain("border");

    rerender(<Button variant="secondary">Secondary</Button>);
    button = getByRole("button", { name: /secondary/i });
    expect(button.className).toContain("bg-secondary");
  });
});
