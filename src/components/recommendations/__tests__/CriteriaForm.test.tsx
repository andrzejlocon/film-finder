// src/components/recommendations/CriteriaForm.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CriteriaForm } from "../CriteriaForm";
import type { RecommendationCriteria } from "@/types";

describe("CriteriaForm", () => {
  // Mock callbacks
  const onCriteriaChangeMock = vi.fn();
  const onFillFromProfileMock = vi.fn();
  const onGenerateRecommendationsMock = vi.fn();

  // Default criteria for testing
  const defaultCriteria: RecommendationCriteria = {
    actors: [],
    directors: [],
    genres: [],
    year_from: undefined,
    year_to: undefined,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. Test year validation logic
  describe("Year validation", () => {
    it("should display error message when year_from is greater than year_to", async () => {
      // Arrange
      render(
        <CriteriaForm
          criteria={{
            ...defaultCriteria,
            year_from: 2020,
            year_to: 2010,
          }}
          onCriteriaChange={onCriteriaChangeMock}
          onFillFromProfile={onFillFromProfileMock}
          onGenerateRecommendations={onGenerateRecommendationsMock}
          isLoading={false}
        />
      );

      // Assert
      expect(screen.getByText("Year From must be less than or equal to Year To")).toBeInTheDocument();
    });

    it("should not display error message when year validation passes", () => {
      // Arrange
      render(
        <CriteriaForm
          criteria={{
            ...defaultCriteria,
            year_from: 2010,
            year_to: 2020,
          }}
          onCriteriaChange={onCriteriaChangeMock}
          onFillFromProfile={onFillFromProfileMock}
          onGenerateRecommendations={onGenerateRecommendationsMock}
          isLoading={false}
        />
      );

      // Assert
      expect(screen.queryByText("Year From must be less than or equal to Year To")).not.toBeInTheDocument();
    });
  });

  // 2. Test event handler functions
  describe("Input handling", () => {
    it("should add an actor when pressing Enter in the actor input field", async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <CriteriaForm
          criteria={defaultCriteria}
          onCriteriaChange={onCriteriaChangeMock}
          onFillFromProfile={onFillFromProfileMock}
          onGenerateRecommendations={onGenerateRecommendationsMock}
          isLoading={false}
        />
      );

      // Act
      const input = screen.getByLabelText("Actors");
      await user.type(input, "Tom Hanks");
      await user.keyboard("{Enter}");

      // Assert
      expect(onCriteriaChangeMock).toHaveBeenCalledWith({
        ...defaultCriteria,
        actors: ["Tom Hanks"],
      });
    });

    it("should remove an actor when clicking the X button", async () => {
      // Arrange
      const user = userEvent.setup();
      const criteriaWithActors = {
        ...defaultCriteria,
        actors: ["Tom Hanks", "Meryl Streep"],
      };

      render(
        <CriteriaForm
          criteria={criteriaWithActors}
          onCriteriaChange={onCriteriaChangeMock}
          onFillFromProfile={onFillFromProfileMock}
          onGenerateRecommendations={onGenerateRecommendationsMock}
          isLoading={false}
        />
      );

      // Act
      const removeButtons = screen.getAllByRole("button", { name: "" });
      await user.click(removeButtons[0]); // Click the first X button

      // Assert
      expect(onCriteriaChangeMock).toHaveBeenCalledWith({
        ...criteriaWithActors,
        actors: ["Meryl Streep"],
      });
    });
  });

  // 3. Test button disabled states
  describe("Button states", () => {
    it("should disable the Generate Recommendations button when there are validation errors", () => {
      // Arrange
      render(
        <CriteriaForm
          criteria={{
            ...defaultCriteria,
            year_from: 2020,
            year_to: 2010,
          }}
          onCriteriaChange={onCriteriaChangeMock}
          onFillFromProfile={onFillFromProfileMock}
          onGenerateRecommendations={onGenerateRecommendationsMock}
          isLoading={false}
        />
      );

      // Assert
      expect(screen.getByRole("button", { name: /Generate Recommendations|Generate/i })).toBeDisabled();
    });

    it("should disable the Generate Recommendations button when isLoading is true", () => {
      // Arrange
      render(
        <CriteriaForm
          criteria={defaultCriteria}
          onCriteriaChange={onCriteriaChangeMock}
          onFillFromProfile={onFillFromProfileMock}
          onGenerateRecommendations={onGenerateRecommendationsMock}
          isLoading={true}
        />
      );

      // Assert
      expect(screen.getByRole("button", { name: /Generate Recommendations|Generate/i })).toBeDisabled();
    });

    it("should disable the Fill from Profile button when isLoading is true", () => {
      // Arrange
      render(
        <CriteriaForm
          criteria={defaultCriteria}
          onCriteriaChange={onCriteriaChangeMock}
          onFillFromProfile={onFillFromProfileMock}
          onGenerateRecommendations={onGenerateRecommendationsMock}
          isLoading={true}
        />
      );

      // Assert
      expect(screen.getByText("Fill from Profile")).toBeDisabled();
    });
  });

  // 4. Test callback invocations
  describe("Callback invocations", () => {
    it("should call onFillFromProfile when Fill from Profile button is clicked", async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <CriteriaForm
          criteria={defaultCriteria}
          onCriteriaChange={onCriteriaChangeMock}
          onFillFromProfile={onFillFromProfileMock}
          onGenerateRecommendations={onGenerateRecommendationsMock}
          isLoading={false}
        />
      );

      // Act
      await user.click(screen.getByText("Fill from Profile"));

      // Assert
      expect(onFillFromProfileMock).toHaveBeenCalledTimes(1);
    });

    it("should call onGenerateRecommendations when Generate Recommendations button is clicked", async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <CriteriaForm
          criteria={defaultCriteria}
          onCriteriaChange={onCriteriaChangeMock}
          onFillFromProfile={onFillFromProfileMock}
          onGenerateRecommendations={onGenerateRecommendationsMock}
          isLoading={false}
        />
      );

      // Act
      await user.click(screen.getByText(/Generate Recommendations/i));

      // Assert
      expect(onGenerateRecommendationsMock).toHaveBeenCalledTimes(1);
    });
  });

  // 5. Test dynamic rendering of criteria items
  describe("Dynamic rendering", () => {
    it("should render the correct number of badges for each criteria type", () => {
      // Arrange
      const populatedCriteria = {
        actors: ["Tom Hanks", "Meryl Streep"],
        directors: ["Steven Spielberg"],
        genres: ["Drama", "Comedy", "Action"],
        year_from: 2010,
        year_to: 2020,
      };

      render(
        <CriteriaForm
          criteria={populatedCriteria}
          onCriteriaChange={onCriteriaChangeMock}
          onFillFromProfile={onFillFromProfileMock}
          onGenerateRecommendations={onGenerateRecommendationsMock}
          isLoading={false}
        />
      );

      // Assert
      expect(screen.getByText("Tom Hanks")).toBeInTheDocument();
      expect(screen.getByText("Meryl Streep")).toBeInTheDocument();
      expect(screen.getByText("Steven Spielberg")).toBeInTheDocument();
      expect(screen.getByText("Drama")).toBeInTheDocument();
      expect(screen.getByText("Comedy")).toBeInTheDocument();
      expect(screen.getByText("Action")).toBeInTheDocument();
    });
  });
});
