import type { CreateFilmInput, FilmDTO } from "../../types";
import type { CreateFilmCommandSchema } from "../schemas/films.schema";
import type { SupabaseClient } from "../../db/supabase.client";

export class FilmsService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Checks if any of the films already exist for the given user
   * @returns Array of duplicate film titles if found
   */
  private async checkForDuplicates(userId: string, films: CreateFilmInput[]): Promise<string[]> {
    const titles = films.map((film) => film.title);

    const { data: existingFilms } = await this.supabase
      .from("user_films")
      .select("title")
      .eq("user_id", userId)
      .in("title", titles);

    return existingFilms?.map((film) => film.title) ?? [];
  }

  /**
   * Creates multiple films for a user in a single transaction
   * @throws Error if duplicate films are found
   */
  async createFilms(userId: string, command: CreateFilmCommandSchema): Promise<FilmDTO[]> {
    // Check for duplicates first
    const duplicates = await this.checkForDuplicates(userId, command.films);
    if (duplicates.length > 0) {
      throw new Error(`Following films already exist: ${duplicates.join(", ")}`);
    }

    // Prepare films data with user_id
    const filmsToCreate = command.films.map((film) => ({
      ...film,
      user_id: userId,
    }));

    // Insert all films in a single transaction
    const { data: createdFilms, error } = await this.supabase.from("user_films").insert(filmsToCreate).select();

    if (error) {
      throw new Error(`Failed to create films: ${error.message}`);
    }

    return createdFilms as FilmDTO[];
  }
}
