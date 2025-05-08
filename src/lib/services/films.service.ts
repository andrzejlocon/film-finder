import type { CreateFilmInput, FilmDTO, FilmStatus, PaginatedResponseDTO } from "@/types.ts";
import { createFilmCommandSchema, type CreateFilmCommandSchema } from "../schemas/films.schema";
import type { SupabaseClient } from "@/db/supabase.client.ts";

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

    const { data: existingFilms, error } = await this.supabase
      .from("user_films")
      .select("title")
      .eq("user_id", userId)
      .in("title", titles);

    if (error) {
      throw new Error(`Failed to check for duplicates: ${error.message}`);
    }

    return existingFilms?.map((film) => film.title) ?? [];
  }

  /**
   * Creates multiple films for a user in a single transaction
   * @throws Error if duplicate films are found or validation fails
   */
  async createFilms(userId: string, command: CreateFilmCommandSchema): Promise<FilmDTO[]> {
    // Validate input data
    const validationResult = createFilmCommandSchema.safeParse(command);
    if (!validationResult.success) {
      throw new Error(`Invalid input data: ${validationResult.error.message}`);
    }

    // Check for duplicates first
    const duplicates = await this.checkForDuplicates(userId, validationResult.data.films);
    if (duplicates.length > 0) {
      throw new Error(`Following films already exist: ${duplicates.join(", ")}`);
    }

    // Prepare films data with user_id
    const filmsToCreate = validationResult.data.films.map((film) => ({
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
    { status, page = 1, limit = 9, search }: GetUserFilmsFilters = {}
  ): Promise<PaginatedResponseDTO<FilmDTO>> {
    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Start building the query
    let query = this.supabase
      .from("user_films")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });

    // Apply optional filters
    if (status) {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    // Apply pagination after all filters
    query = query.range(offset, offset + limit - 1);

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

  /**
   * Updates the status of a film and logs the change
   * @param userId - The ID of the user who owns the film
   * @param filmId - The ID of the film to update
   * @param newStatus - The new status to set
   * @returns The updated film
   * @throws Error if film is not found or user is not authorized
   */
  async updateFilmStatus(userId: string, filmId: number, newStatus: FilmStatus): Promise<FilmDTO> {
    // Get the current film to verify ownership and get current status
    const { data: film, error: fetchError } = await this.supabase
      .from("user_films")
      .select("*")
      .eq("id", filmId)
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      throw new Error("Film not found or you are not authorized to update it");
    }

    const prevStatus = film.status;

    // Start a transaction to update both film status and create a log entry
    const { data: updatedFilm, error: updateError } = await this.supabase.rpc("update_film_status", {
      p_film_id: filmId,
      p_user_id: userId,
      p_new_status: newStatus,
      p_prev_status: prevStatus,
    });

    if (updateError) {
      throw new Error(`Failed to update film status: ${updateError.message}`);
    }

    return updatedFilm as FilmDTO;
  }

  /**
   * Deletes a film for a given user
   * @param userId - The ID of the user who owns the film
   * @param filmId - The ID of the film to delete
   * @throws Error if film is not found or user is not authorized
   */
  async deleteFilm(userId: string, filmId: number): Promise<void> {
    const { error } = await this.supabase.from("user_films").delete().eq("id", filmId).eq("user_id", userId);

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error("Film not found or you are not authorized to delete it");
      }
      throw new Error(`Failed to delete film: ${error.message}`);
    }
  }
}
