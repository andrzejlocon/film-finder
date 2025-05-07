import { useEffect, useRef } from "react";
import type { FilmDTO, FilmStatus } from "@/types";
import { FilmCard } from "./FilmCard";
import { FilmCardSkeleton } from "./FilmCardSkeleton";

interface FilmListProps {
  films: FilmDTO[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onFilmStatusChange: (filmId: number, newStatus: FilmStatus) => void;
  onFilmDeleteRequest: (filmId: number, filmTitle: string) => void;
  limitPerPage: number;
}

export function FilmList({
  films,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  onFilmStatusChange,
  onFilmDeleteRequest,
  limitPerPage,
}: FilmListProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, isLoading, onLoadMore]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: limitPerPage }).map((_, index) => (
          <FilmCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (films.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nie znaleziono filmów pasujących do kryteriów.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {films.map((film) => (
          <FilmCard
            key={film.id}
            film={film}
            onStatusChange={onFilmStatusChange}
            onDeleteRequest={onFilmDeleteRequest}
          />
        ))}
      </div>

      {isLoadingMore && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <FilmCardSkeleton key={`loading-more-${index}`} />
          ))}
        </div>
      )}

      <div ref={observerTarget} className="h-4 w-full" />
    </>
  );
}
