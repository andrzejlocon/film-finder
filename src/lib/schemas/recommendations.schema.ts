import { z } from "zod";

// Schema for recommendation criteria
export const recommendationCriteriaSchema = z
  .object({
    actors: z.array(z.string()).optional(),
    directors: z.array(z.string()).optional(),
    genres: z.array(z.string()).optional(),
    year_from: z.number().int().min(1888).optional(), // First movie was made in 1888
    year_to: z.number().int().max(new Date().getFullYear()).optional(),
  })
  .refine(
    (data) => {
      // If year_from is provided, year_to must be greater than or equal to it
      if (data.year_from && data.year_to) {
        return data.year_to >= data.year_from;
      }
      return true;
    },
    {
      message: "year_to must be greater than or equal to year_from",
    }
  );

// Schema for the recommendation request command
export const recommendationCriteriaCommandSchema = z.object({
  criteria: recommendationCriteriaSchema.optional(),
});

// Schema for the recommended film response
export const recommendedFilmSchema = z.object({
  title: z.string(),
  year: z.number().int(),
  description: z.string().optional(),
  genres: z.array(z.string()),
  actors: z.array(z.string()),
  director: z.string(),
});

// Schema for the complete recommendation response
export const recommendationResponseSchema = z.object({
  recommendations: z.array(recommendedFilmSchema),
  generation_id: z.number().int(),
  generated_count: z.number().int(),
});
