/*
  DTO and Command Model Definitions for the Film Finder API
  These types are derived from the database models and align with the API plan.
*/

import type { Database } from "./db/database.types";

// Aliases for database table types
// User Film
export type FilmDTO = Database["public"]["Tables"]["user_films"]["Row"];

// Command for creating films
// Omit auto-generated fields: id, created_at, updated_at, user_id
export type CreateFilmInput = Omit<
  Database["public"]["Tables"]["user_films"]["Insert"],
  "id" | "created_at" | "updated_at" | "user_id"
>;

export interface CreateFilmCommand {
  films: CreateFilmInput[];
}

// Command for updating a film
// Partial update excluding non-modifiable or auto-managed fields.
export type UpdateFilmCommand = Partial<
  Omit<Database["public"]["Tables"]["user_films"]["Update"], "id" | "user_id" | "created_at" | "updated_at">
>;

// Command for updating a film's status
// Allowed statuses: "to-watch", "watched", "rejected"
export type FilmStatus = "to-watch" | "watched" | "rejected";

export interface UpdateFilmStatusCommand {
  new_status: FilmStatus;
}

// Preferences DTO from user_preferences table
export type PreferencesDTO = Database["public"]["Tables"]["user_preferences"]["Row"];

// Command for creating/updating user preferences
// Omitting auto-managed fields: id and user_id
export type UpdatePreferencesCommand = Omit<
  Database["public"]["Tables"]["user_preferences"]["Insert"],
  "id" | "user_id"
>;

// Recommendation Criteria used in recommendation generation
export interface RecommendationCriteria {
  actors?: string[];
  directors?: string[];
  genres?: string[];
  year_from?: number;
  year_to?: number;
}

export interface RecommendationCriteriaCommand {
  criteria?: RecommendationCriteria;
}

export type RecommendedFilmDTO = Pick<FilmDTO, "title" | "year" | "description" | "genres" | "actors" | "director">;

// Response DTO for recommendations endpoint
// Contains recommended films and generation metadata
export interface RecommendationResponseDTO {
  recommendations: RecommendedFilmDTO[];
  generation_id: number;
  generated_count: number;
}

// DTO for film status logs
export type FilmStatusLogDTO = Database["public"]["Tables"]["film_status_logs"]["Row"];

// DTO for generation logs
export type GenerationLogDTO = Database["public"]["Tables"]["generation_logs"]["Row"];

// DTO for generation error logs
export type GenerationErrorLogDTO = Database["public"]["Tables"]["generation_error_logs"]["Row"];

// Generic pagination response DTO
export interface PaginatedResponseDTO<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}
