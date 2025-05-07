import { useState, useCallback } from "react";
import type { FilmDTO, FilmStatus, PaginatedResponseDTO, UpdateFilmStatusCommand } from "@/types";

interface FilmManagementFilters {
  status: FilmStatus;
  search: string;
  page: number;
}

const ITEMS_PER_PAGE = 9;

export function useFilms() {
  const [films, setFilms] = useState<FilmDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchFilms = useCallback(async (filters: FilmManagementFilters, concatResults = false) => {
    try {
      const controller = new AbortController();
      setError(null);

      if (!concatResults) {
        setIsLoading(true);
        setFilms([]);
      } else {
        setIsLoadingMore(true);
      }

      const queryParams = new URLSearchParams({
        status: filters.status,
        page: String(filters.page),
        limit: String(ITEMS_PER_PAGE),
      });

      if (filters.search) {
        queryParams.append("search", filters.search);
      }

      const response = await fetch(`/api/films?${queryParams}`, {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Wystąpił błąd podczas pobierania filmów");
      }

      const data: PaginatedResponseDTO<FilmDTO> = await response.json();

      setFilms((prevFilms) => (concatResults ? [...prevFilms, ...data.data] : data.data));
      setCurrentPage(filters.page);
      setHasMore(data.data.length === ITEMS_PER_PAGE); // If we got less than limit, there are no more pages

      return data;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Wystąpił nieznany błąd");
      }
      return null;
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  const loadMoreFilms = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    const currentStatus = (films[0]?.status as FilmStatus) || "to-watch";

    await fetchFilms(
      {
        status: currentStatus,
        search: "",
        page: currentPage + 1,
      },
      true
    );
  }, [currentPage, fetchFilms, films, hasMore, isLoadingMore]);

  const updateFilmStatus = useCallback(async (filmId: number, newStatus: FilmStatus) => {
    try {
      setError(null);

      const command: UpdateFilmStatusCommand = {
        new_status: newStatus,
      };

      const response = await fetch(`/api/films/${filmId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        throw new Error("Nie udało się zaktualizować statusu filmu");
      }

      const updatedFilm: FilmDTO = await response.json();

      setFilms((prevFilms) => prevFilms.map((film) => (film.id === filmId ? updatedFilm : film)));

      return updatedFilm;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Wystąpił nieznany błąd");
      }
      return null;
    }
  }, []);

  const deleteFilm = useCallback(async (filmId: number) => {
    try {
      setError(null);

      const response = await fetch(`/api/films/${filmId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Nie udało się usunąć filmu");
      }

      setFilms((prevFilms) => prevFilms.filter((film) => film.id !== filmId));
      return true;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Wystąpił nieznany błąd");
      }
      return false;
    }
  }, []);

  return {
    films,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    fetchFilms,
    loadMoreFilms,
    updateFilmStatus,
    deleteFilm,
  };
}
