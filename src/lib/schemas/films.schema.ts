import { z } from "zod";
import type { FilmStatus } from "@/types";

// Constants for validation
const MIN_MOVIE_YEAR = 1887;
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
    .refine((year) => year <= new Date().getFullYear(), "Year cannot be in the future"),
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

// Schema for GET /films query parameters
export const getFilmsQuerySchema = z.object({
  status: z.enum(["to-watch", "watched", "rejected"] as const).optional(),
  page: z.coerce
    .number()
    .int()
    .min(1)
    .optional()
    .transform((val) => val ?? 1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .transform((val) => val ?? 9),
  search: z.string().min(1).optional(),
});

export type GetFilmsQuerySchema = z.infer<typeof getFilmsQuerySchema>;

// Schema for POST /films/{filmId}/status request body
export const updateStatusSchema = z.object({
  new_status: filmStatusEnum,
});

// Schema for filmId path parameter
export const filmIdSchema = z.coerce.number().int("Film ID must be an integer").positive("Film ID must be positive");

export type UpdateStatusSchema = z.infer<typeof updateStatusSchema>;
export type FilmIdSchema = z.infer<typeof filmIdSchema>;
