import crypto from "crypto";
import type { SupabaseClient } from "../../db/supabase.client";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
import type { RecommendationCriteria, RecommendationResponseDTO, RecommendedFilmDTO } from "../../types";
import { recommendationCriteriaSchema } from "../schemas/recommendations.schema";

export class RecommendationService {
  constructor(private readonly supabase: SupabaseClient) {}

  private generateCriteriaHash(criteria: RecommendationCriteria | null): string {
    if (!criteria) return "";
    const criteriaString = JSON.stringify(criteria);
    return crypto.createHash("md5").update(criteriaString).digest("hex");
  }

  private getMockedRecommendations(): RecommendedFilmDTO[] {
    return [
      {
        title: "Inception",
        year: 2010,
        description:
          "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
        genres: ["Action", "Sci-Fi", "Thriller"],
        actors: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Ellen Page"],
        director: "Christopher Nolan",
      },
      {
        title: "The Matrix",
        year: 1999,
        description:
          "A computer programmer discovers that reality as he knows it is a simulation created by machines, and joins a rebellion to break free.",
        genres: ["Action", "Sci-Fi"],
        actors: ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss"],
        director: "Lana Wachowski",
      },
      {
        title: "Interstellar",
        year: 2014,
        description:
          "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
        genres: ["Adventure", "Drama", "Sci-Fi"],
        actors: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
        director: "Christopher Nolan",
      },
    ];
  }

  async getRecommendations(criteria?: RecommendationCriteria): Promise<RecommendationResponseDTO> {
    const startTime = Date.now();

    try {
      // Validate criteria if provided
      if (criteria) {
        const validationResult = recommendationCriteriaSchema.safeParse(criteria);
        if (!validationResult.success) {
          throw new Error(`Invalid criteria: ${validationResult.error.message}`);
        }
      }

      // If no criteria provided, try to get user preferences
      if (!criteria) {
        const { data: preferences, error: preferencesError } = await this.supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", DEFAULT_USER_ID)
          .maybeSingle();

        // Only throw if it's a real error, not just missing preferences
        if (preferencesError && preferencesError.code !== "PGRST116") {
          throw new Error(`Failed to fetch user preferences: ${preferencesError.message}`);
        }

        // If we have preferences, use them as criteria
        if (preferences) {
          criteria = {
            genres: preferences.genres || undefined,
            actors: preferences.actors || undefined,
            directors: preferences.directors || undefined,
            year_from: preferences.year_from || undefined,
            year_to: preferences.year_to || undefined,
          };
        }
      }

      // Get mocked recommendations (TODO: Replace with actual AI API call)
      const recommendations = this.getMockedRecommendations();

      // Log the generation
      const { data: generationLog, error: logError } = await this.supabase
        .from("generation_logs")
        .insert({
          user_id: DEFAULT_USER_ID,
          criteria_hash: this.generateCriteriaHash(criteria || null),
          generation_duration: Date.now() - startTime,
          model: "gpt-4",
          generated_count: recommendations.length,
        })
        .select()
        .single();

      if (logError) {
        throw new Error(`Failed to log generation: ${logError.message}`);
      }

      return {
        recommendations,
        generation_id: generationLog.id,
        generated_count: generationLog.generated_count,
      };
    } catch (error) {
      // Log error
      await this.supabase.from("generation_error_logs").insert({
        user_id: DEFAULT_USER_ID,
        error_message: error instanceof Error ? error.message : "Unknown error",
        criteria_hash: this.generateCriteriaHash(criteria || null),
        error_code: "GENERATION_ERROR",
        model: "gpt-4",
      });

      throw error;
    }
  }
}
