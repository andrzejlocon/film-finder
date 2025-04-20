import { z } from "zod";
import type { FilmStatus } from "../../types";

// Constants for validation
const MIN_MOVIE_YEAR = 1887;
const CURRENT_YEAR = new Date().getFullYear();
const MAX_FILMS_PER_REQUEST = 100;

// Film status validation
const filmStatusEnum = z.enum(["to-watch", "watched", "rejected"]) as z.ZodEnum<[FilmStatus, ...FilmStatus[]]>;

// Single film validation schema
export const createFilmSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  year: z
    .number()
    .int("Year must be an integer")
    .min(MIN_MOVIE_YEAR, `Year must be ${MIN_MOVIE_YEAR} or later`)
    .max(CURRENT_YEAR, "Year cannot be in the future"),
  description: z.string().min(1, "Description is required"),
  genres: z.array(z.string()).min(1, "At least one genre is required"),
  actors: z.array(z.string()).min(1, "At least one actor is required"),
  director: z.string().min(1, "Director is required"),
  status: filmStatusEnum,
  generation_id: z.number().int("Generation ID must be an integer"),
});

// Command validation schema for creating multiple films
export const createFilmCommandSchema = z.object({
  films: z
    .array(createFilmSchema)
    .min(1, "At least one film is required")
    .max(MAX_FILMS_PER_REQUEST, `Cannot create more than ${MAX_FILMS_PER_REQUEST} films in a single request`),
});

// Type inference
export type CreateFilmSchema = z.infer<typeof createFilmSchema>;
export type CreateFilmCommandSchema = z.infer<typeof createFilmCommandSchema>;
