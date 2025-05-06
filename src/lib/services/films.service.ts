import type { CreateFilmInput, FilmDTO, FilmStatus, PaginatedResponseDTO } from "../../types";
import type { CreateFilmCommandSchema } from "../schemas/films.schema";
import type { SupabaseClient } from "../../db/supabase.client";

interface GetUserFilmsFilters {
  status?: FilmStatus;
  page?: number;
  limit?: number;
  search?: string;
}

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

  /**
   * Retrieves paginated list of user's films with optional filtering
   * @param userId - The ID of the user whose films to retrieve
   * @param filters - Optional filters for status, pagination and search
   * @returns Paginated response with films and metadata
   */
  async getUserFilms(
    userId: string,
    { status, page = 1, limit = 10, search }: GetUserFilmsFilters = {}
  ): Promise<PaginatedResponseDTO<FilmDTO>> {
    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Start building the query
    let query = this.supabase.from("user_films").select("*", { count: "exact" }).eq("user_id", userId);

    // Apply optional filters
    if (status) {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1).order("created_at", { ascending: false });

    // Execute the query
    const { data: films, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch films: ${error.message}`);
    }

    return {
      data: films as FilmDTO[],
      page,
      limit,
      total: count ?? 0,
    };
  }
}
