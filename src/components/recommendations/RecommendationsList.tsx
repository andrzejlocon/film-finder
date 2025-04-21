import type { RecommendedFilmDTO } from "@/types";
import { RecommendationCard } from "./RecommendationCard";
import { SkeletonLoader } from "./SkeletonLoader";

interface RecommendationsListProps {
  recommendations: RecommendedFilmDTO[];
  isLoading: boolean;
  onStatusChange: (filmId: string, status: "to-watch" | "watched" | "rejected") => void;
  filmStatuses: Map<string, "to-watch" | "watched" | "rejected">;
  wasSearchPerformed: boolean;
}

export function RecommendationsList({
  recommendations,
  isLoading,
  onStatusChange,
  filmStatuses,
  wasSearchPerformed,
}: RecommendationsListProps) {
  if (isLoading) {
    return <SkeletonLoader count={3} />;
  }

  if (wasSearchPerformed && recommendations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No recommendations found. Try adjusting your search criteria.</p>
      </div>
    );
  }

  if (!wasSearchPerformed) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {recommendations.map((film) => {
        const filmId = `${film.title}-${film.year}`;
        return (
          <RecommendationCard
            key={filmId}
            film={film}
            onStatusChange={onStatusChange}
            currentStatus={filmStatuses.get(filmId)}
          />
        );
      })}
    </div>
  );
}
