import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/**
 * Wrapper dla konfiguracji renderowania komponentów w testach
 */
const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) => {
  return {
    user: userEvent.setup(),
    ...render(ui, { ...options }),
  };
};

export * from "@testing-library/react";
export { customRender as render, userEvent };
