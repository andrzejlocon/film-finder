import { useState } from "react";
import type { RecommendationCriteria, RecommendationResponseDTO, RecommendedFilmDTO } from "@/types";
import { CriteriaForm } from "./CriteriaForm";
import { RecommendationsList } from "./RecommendationsList";
import { SaveRecommendationsButton } from "./SaveRecommendationsButton";
import { toast } from "sonner";

interface RecommendationViewState {
  isLoading: boolean;
  error: string | null;
  recommendations: RecommendedFilmDTO[];
  filmStatuses: Map<string, "to-watch" | "watched" | "rejected">;
  isSaving: boolean;
  generation_id?: number;
  wasSearchPerformed: boolean;
}

export function RecommendationView() {
  const [criteria, setCriteria] = useState<RecommendationCriteria>({
    actors: [],
    directors: [],
    genres: [],
  });

  const [state, setState] = useState<RecommendationViewState>({
    isLoading: false,
    error: null,
    recommendations: [],
    filmStatuses: new Map(),
    isSaving: false,
    wasSearchPerformed: false,
  });

  const handleCriteriaChange = (newCriteria: RecommendationCriteria) => {
    setCriteria(newCriteria);
    // Reset search state when criteria change
    setState((prev) => ({
      ...prev,
      wasSearchPerformed: false,
      recommendations: [],
      filmStatuses: new Map(),
      generation_id: undefined,
    }));
  };

  const handleFillFromProfile = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const response = await fetch("/api/preferences");
      if (!response.ok) throw new Error("Failed to fetch preferences");

      const preferences = await response.json();
      setCriteria((prev) => ({
        ...prev,
        actors: preferences.favorite_actors || [],
        directors: preferences.favorite_directors || [],
        genres: preferences.favorite_genres || [],
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to load preferences",
      }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleGenerateRecommendations = async () => {
    try {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        filmStatuses: new Map(),
        wasSearchPerformed: true,
      }));

      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ criteria }),
      });

      if (!response.ok) throw new Error("Failed to generate recommendations");

      const data: RecommendationResponseDTO = await response.json();
      setState((prev) => ({
        ...prev,
        recommendations: data.recommendations,
        generation_id: data.generation_id,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to generate recommendations",
      }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleStatusChange = (filmId: string, status: "to-watch" | "watched" | "rejected") => {
    setState((prev) => {
      const newStatuses = new Map(prev.filmStatuses);

      // If the status is the same as current, remove it (toggle behavior)
      if (newStatuses.get(filmId) === status) {
        newStatuses.delete(filmId);
      } else {
        newStatuses.set(filmId, status);
      }

      return { ...prev, filmStatuses: newStatuses };
    });
  };

  const handleSaveRecommendations = async () => {
    if (!state.generation_id) return;

    try {
      setState((prev) => ({ ...prev, isSaving: true, error: null }));

      const filmsToSave = Array.from(state.filmStatuses.entries()).map(([filmId, status]) => {
        // Find the full film data from recommendations
        const [title, yearStr] = filmId.split("-");
        const film = state.recommendations.find((r) => r.title === title && r.year === parseInt(yearStr, 10));

        if (!film) throw new Error(`Film data not found for ${filmId}`);

        return {
          title: film.title,
          year: film.year,
          description: film.description,
          genres: film.genres,
          actors: film.actors,
          director: film.director,
          status,
          generation_id: state.generation_id,
        };
      });

      const response = await fetch("/api/films", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ films: filmsToSave }),
      });

      if (!response.ok) throw new Error("Failed to save films");

      // Show success toast
      toast.success(`Successfully saved ${filmsToSave.length} films`);

      // Reset form and recommendations
      setCriteria({
        actors: [],
        directors: [],
        genres: [],
      });

      setState((prev) => ({
        ...prev,
        recommendations: [],
        filmStatuses: new Map(),
        generation_id: undefined,
        wasSearchPerformed: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to save films",
      }));
      // Show error toast
      toast.error(error instanceof Error ? error.message : "Failed to save films");
    } finally {
      setState((prev) => ({ ...prev, isSaving: false }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Film Recommendations</h1>

      <CriteriaForm
        criteria={criteria}
        onCriteriaChange={handleCriteriaChange}
        onFillFromProfile={handleFillFromProfile}
        onGenerateRecommendations={handleGenerateRecommendations}
        isLoading={state.isLoading}
      />

      {state.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
          <span className="block sm:inline">{state.error}</span>
        </div>
      )}

      <RecommendationsList
        recommendations={state.recommendations}
        isLoading={state.isLoading}
        onStatusChange={handleStatusChange}
        filmStatuses={state.filmStatuses}
        wasSearchPerformed={state.wasSearchPerformed}
      />

      {state.recommendations.length > 0 && (
        <SaveRecommendationsButton
          selectedCount={state.filmStatuses.size}
          onSave={handleSaveRecommendations}
          isSaving={state.isSaving}
          className="mt-8"
        />
      )}
    </div>
  );
}
