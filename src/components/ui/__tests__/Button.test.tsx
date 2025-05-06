import { describe, it, expect, vi } from "vitest";
import { render } from "../../../../test/helpers";
import { Button } from "../button";

describe("Button", () => {
  it("renders with correct content", () => {
    const { getByRole } = render(<Button>Click me</Button>);

    expect(getByRole("button", { name: /click me/i })).toBeTruthy();
  });

  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn();
    const { getByRole, user } = render(<Button onClick={handleClick}>Click me</Button>);

    const button = getByRole("button", { name: /click me/i });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when it has the disabled attribute", () => {
    const { getByRole } = render(<Button disabled>Click me</Button>);

    const button = getByRole("button", { name: /click me/i });
    expect(button).toHaveAttribute("disabled");
  });

  it("handles different variants", () => {
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
