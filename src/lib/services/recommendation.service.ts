import crypto from "crypto";
import type { SupabaseClient } from "../../db/supabase.client";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
import type { RecommendationCriteria, RecommendationResponseDTO, RecommendedFilmDTO } from "../../types";
import { recommendationCriteriaSchema } from "../schemas/recommendations.schema";
import { OpenRouterService } from "./openrouter.service";

export class RecommendationService {
  private readonly openRouter: OpenRouterService;

  constructor(private readonly supabase: SupabaseClient) {
    this.openRouter = new OpenRouterService();
  }

  private generateCriteriaHash(criteria: RecommendationCriteria | null): string {
    if (!criteria) return "";
    const criteriaString = JSON.stringify(criteria);
    return crypto.createHash("md5").update(criteriaString).digest("hex");
  }

  private buildPrompt(criteria: RecommendationCriteria | null): string {
    let prompt =
      "Please recommend 10 movies. For each movie, provide: title, year, description, genres (as array), actors (as array), and director. Format as JSON array.";

    if (criteria) {
      if (criteria.genres?.length) {
        prompt += `\nPreferred genres: ${criteria.genres.join(", ")}.`;
      }
      if (criteria.actors?.length) {
        prompt += `\nPreferred actors: ${criteria.actors.join(", ")}.`;
      }
      if (criteria.directors?.length) {
        prompt += `\nPreferred directors: ${criteria.directors.join(", ")}.`;
      }
      if (criteria.year_from || criteria.year_to) {
        prompt += `\nYear range: ${criteria.year_from || "any"} to ${criteria.year_to || "any"}.`;
      }
    }

    prompt +=
      "\nResponse must be valid JSON array of objects with exact fields: title, year, description, genres, actors, director.";
    return prompt;
  }

  private parseRecommendations(response: string): RecommendedFilmDTO[] {
    try {
      const parsed = JSON.parse(response) as { movies: RecommendedFilmDTO[] };
      if (!Array.isArray(parsed.movies)) {
        throw new Error("Response is not an array");
      }

      // Validate each film has required fields
      return parsed.movies.map((film) => {
        if (
          !film.title ||
          !film.year ||
          !film.description ||
          !Array.isArray(film.genres) ||
          !Array.isArray(film.actors) ||
          !film.director
        ) {
          throw new Error("Invalid film format in response");
        }
        return film;
      });
    } catch (error) {
      throw new Error(`Failed to parse recommendations: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
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

      // Get recommendations from OpenRouter
      const prompt = this.buildPrompt(criteria || null);
      const response = await this.openRouter.sendChatRequest(prompt);

      if (!response.choices?.[0]?.message?.content) {
        throw new Error("Invalid response format from OpenRouter");
      }

      const recommendations = this.parseRecommendations(response.choices[0].message.content);

      // Log the generation
      const { data: generationLog, error: logError } = await this.supabase
        .from("generation_logs")
        .insert({
          user_id: DEFAULT_USER_ID,
          criteria_hash: this.generateCriteriaHash(criteria || null),
          generation_duration: Date.now() - startTime,
          model: response.model,
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
        model: "openai/gpt-4o-mini",
      });

      throw error;
    }
  }
}
