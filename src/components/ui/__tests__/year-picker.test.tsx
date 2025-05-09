import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { YearPicker } from "../year-picker";
import * as React from "react";

// Mock constants from the component
const MIN_YEAR = 1887;
const CURRENT_YEAR = new Date().getFullYear();
const YEARS_PER_PAGE = 20;

// Types for mock components
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: string;
  className?: string;
}

interface LabelProps {
  children: React.ReactNode;
}

interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface PopoverTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
  align?: string;
}

// Mock UI components to simplify tests
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, variant, className }: ButtonProps) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      className={className}
      data-testid={
        className?.includes("h-8")
          ? `year-button-${children}`
          : className?.includes("w-32")
            ? "year-picker-trigger"
            : undefined
      }
    >
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({ children }: LabelProps) => <label>{children}</label>,
}));

vi.mock("@/components/ui/popover", () => ({
  Popover: ({ children, open, onOpenChange }: PopoverProps) => (
    <div data-testid="popover" data-open={open}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<PopoverTriggerProps>, {
            open,
            onOpenChange,
          });
        }
        return child;
      })}
    </div>
  ),
  PopoverTrigger: ({ children, asChild }: PopoverTriggerProps) => (
    <div data-testid="popover-trigger" data-as-child={asChild}>
      {children}
    </div>
  ),
  PopoverContent: ({ children, className, align }: PopoverContentProps) => (
    <div data-testid="popover-content" className={className} data-align={align}>
      {children}
    </div>
  ),
}));

vi.mock("lucide-react", () => ({
  ChevronLeft: () => <span data-testid="chevron-left">←</span>,
  ChevronRight: () => <span data-testid="chevron-right">→</span>,
  CalendarIcon: () => <span data-testid="calendar-icon">📅</span>,
}));

vi.mock("@/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

describe("YearPicker", () => {
  const onChange = vi.fn();

  beforeEach(() => {
    onChange.mockClear();
  });

  describe("State initialization", () => {
    it("should initialize with current year when no value is provided", () => {
      // Arrange
      render(<YearPicker onChange={onChange} label="Year" />);

      // Act
      fireEvent.click(screen.getByTestId("popover-trigger"));

      // Assert
      const expectedPage = Math.floor((CURRENT_YEAR - MIN_YEAR) / YEARS_PER_PAGE);
      const startYear = MIN_YEAR + expectedPage * YEARS_PER_PAGE;
      expect(
        screen.getByText(`${startYear} - ${Math.min(startYear + YEARS_PER_PAGE - 1, CURRENT_YEAR)}`)
      ).toBeInTheDocument();
    });

    it("should initialize with provided value", () => {
      // Arrange
      const testYear = 1950;
      render(<YearPicker value={testYear} onChange={onChange} label="Year" />);

      // Act

      // Assert
      const yearPickerTrigger = screen.getByTestId("year-picker-trigger");
      expect(yearPickerTrigger.textContent).toContain("1950");
    });
  });

  describe("Event handling", () => {
    it("should call onChange when a year is clicked", () => {
      // Arrange
      render(<YearPicker onChange={onChange} label="Year" />);

      // Act
      fireEvent.click(screen.getByTestId("popover-trigger"));
      const currentPage = Math.floor((CURRENT_YEAR - MIN_YEAR) / YEARS_PER_PAGE);
      const startYear = MIN_YEAR + currentPage * YEARS_PER_PAGE;
      fireEvent.click(screen.getByTestId(`year-button-${startYear}`));

      // Assert
      expect(onChange).toHaveBeenCalledWith(startYear);
    });

    it("should change page when navigation buttons are clicked", () => {
      // Arrange
      render(<YearPicker onChange={onChange} label="Year" />);

      // Act
      fireEvent.click(screen.getByTestId("popover-trigger"));
      const initialPage = Math.floor((CURRENT_YEAR - MIN_YEAR) / YEARS_PER_PAGE);
      const initialStartYear = MIN_YEAR + initialPage * YEARS_PER_PAGE;

      // Navigate to previous page
      const leftButton = screen.getByTestId("chevron-left").closest("button");
      if (leftButton) {
        fireEvent.click(leftButton);
      }

      // Assert
      const expectedStartYear = initialStartYear - YEARS_PER_PAGE;
      expect(screen.getByText(`${expectedStartYear} - ${expectedStartYear + YEARS_PER_PAGE - 1}`)).toBeInTheDocument();
    });
  });

  describe("Navigation limits", () => {
    it("should disable left button on first page", () => {
      // Arrange
      render(<YearPicker value={MIN_YEAR} onChange={onChange} label="Year" />);

      // Act
      fireEvent.click(screen.getByTestId("popover-trigger"));

      // Navigate to previous pages until first page
      let leftButton;
      do {
        leftButton = screen.getByTestId("chevron-left").closest("button");
        if (leftButton && !leftButton.hasAttribute("disabled")) {
          fireEvent.click(leftButton);
        }
      } while (leftButton && !leftButton.hasAttribute("disabled"));

      // Assert
      expect(screen.getByTestId("chevron-left").closest("button")).toHaveAttribute("disabled");
    });

    it("should disable right button on last page", () => {
      // Arrange
      render(<YearPicker value={CURRENT_YEAR} onChange={onChange} label="Year" />);

      // Act
      fireEvent.click(screen.getByTestId("popover-trigger"));

      // Navigate to next pages until last page
      let rightButton;
      do {
        rightButton = screen.getByTestId("chevron-right").closest("button");
        if (rightButton && !rightButton.hasAttribute("disabled")) {
          fireEvent.click(rightButton);
        }
      } while (rightButton && !rightButton.hasAttribute("disabled"));

      // Assert
      expect(screen.getByTestId("chevron-right").closest("button")).toHaveAttribute("disabled");
    });
  });

  describe("UI rendering", () => {
    it("should display placeholder when no year is selected", () => {
      // Arrange
      render(<YearPicker onChange={onChange} label="Year" />);

      // Assert
      expect(screen.getByText("Pick year")).toBeInTheDocument();
    });

    it("should display selected year when value is set", () => {
      // Arrange
      const testYear = 1999;
      render(<YearPicker value={testYear} onChange={onChange} label="Year" />);

      // Assert
      const yearPickerTrigger = screen.getByTestId("year-picker-trigger");
      expect(yearPickerTrigger.textContent).toContain("1999");
    });

    it("should render label provided in props", () => {
      // Arrange
      render(<YearPicker onChange={onChange} label="Select year" />);

      // Assert
      expect(screen.getByText("Select year")).toBeInTheDocument();
    });
  });

  describe("Callback integration", () => {
    it("should close popover after year selection", () => {
      // Arrange
      render(<YearPicker onChange={onChange} label="Year" />);

      // Act
      fireEvent.click(screen.getByTestId("popover-trigger"));
      const currentPage = Math.floor((CURRENT_YEAR - MIN_YEAR) / YEARS_PER_PAGE);
      const startYear = MIN_YEAR + currentPage * YEARS_PER_PAGE;
      fireEvent.click(screen.getByTestId(`year-button-${startYear}`));

      // Assert
      expect(screen.getByTestId("popover")).toHaveAttribute("data-open", "false");
    });
  });
});
