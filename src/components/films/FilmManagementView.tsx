import { useState, useEffect } from "react";
import type { FilmStatus } from "@/types";
import { FilmTabs } from "./FilmTabs";
import { FilmSearchInput } from "./FilmSearchInput";
import { FilmList } from "./FilmList";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ITEMS_PER_PAGE, useFilms } from "./hooks/useFilms";

interface FilmToDelete {
  id: number;
  title: string;
}

export function FilmManagementView() {
  // State management
  const [selectedStatus, setSelectedStatus] = useState<FilmStatus>("to-watch");
  const [searchQuery, setSearchQuery] = useState("");
  const [filmToDelete, setFilmToDelete] = useState<FilmToDelete | null>(null);

  // Custom hook for films management
  const {
    films,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    totalCount,
    fetchFilms,
    loadMoreFilms,
    updateFilmStatus,
    deleteFilm,
  } = useFilms();

  // Load initial films
  useEffect(() => {
    fetchFilms({ status: selectedStatus, search: searchQuery, page: 1 });
  }, [fetchFilms, selectedStatus, searchQuery]);

  // Handlers
  const handleStatusChange = (status: FilmStatus) => {
    setSelectedStatus(status);
    fetchFilms({ status, search: searchQuery, page: 1 });
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    fetchFilms({ status: selectedStatus, search: query, page: 1 });
  };

  const handleFilmStatusChange = async (filmId: number, newStatus: FilmStatus) => {
    await updateFilmStatus(filmId, newStatus);
  };

  const handleDeleteRequest = (filmId: number, filmTitle: string) => {
    setFilmToDelete({ id: filmId, title: filmTitle });
  };

  const handleConfirmDelete = async () => {
    if (filmToDelete) {
      await deleteFilm(filmToDelete.id);
      setFilmToDelete(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Films</h1>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <FilmTabs selectedStatus={selectedStatus} onStatusChange={handleStatusChange} totalCount={totalCount} />
          <FilmSearchInput searchQuery={searchQuery} onSearchQueryChange={handleSearchChange} />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FilmList
          films={films}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          onLoadMore={() => loadMoreFilms(selectedStatus, searchQuery)}
          onFilmStatusChange={handleFilmStatusChange}
          onFilmDeleteRequest={handleDeleteRequest}
          limitPerPage={ITEMS_PER_PAGE}
        />

        {filmToDelete && (
          <ConfirmDeleteDialog
            isOpen={true}
            filmTitle={filmToDelete.title}
            onConfirm={handleConfirmDelete}
            onCancel={() => setFilmToDelete(null)}
          />
        )}
      </div>
    </div>
  );
}
