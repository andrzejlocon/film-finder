import type { SupabaseClient } from "@/db/supabase.client.ts";
import type { RecommendationCriteria, RecommendationResponseDTO, RecommendedFilmDTO } from "@/types.ts";
import { recommendationCriteriaSchema } from "../schemas/recommendations.schema";
import { OpenRouterService } from "./openrouter.service";

export class RecommendationService {
  private readonly openRouter: OpenRouterService;

  constructor(private readonly supabase: SupabaseClient) {
    this.openRouter = new OpenRouterService();
  }

  private async generateCriteriaHash(criteria: RecommendationCriteria | null): Promise<string> {
    if (!criteria) return "";
    const criteriaString = JSON.stringify(criteria);

    // Use Web Crypto API
    const msgBuffer = new TextEncoder().encode(criteriaString);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  private buildPrompt(criteria: RecommendationCriteria | null): string {
    let prompt =
      "Please recommend up to 10 films based on the following criteria. Each movie should meet as many of the given preferences as possible, with priority given to matching actors and directors.\n\n";

    if (criteria) {
      if (criteria.actors?.length) {
        prompt += `Preferred actors: ${criteria.actors.join(", ")}.\n`;
      }
      if (criteria.directors?.length) {
        prompt += `Preferred directors: ${criteria.directors.join(", ")}.\n`;
      }
      if (criteria.genres?.length) {
        prompt += `Preferred genres: ${criteria.genres.join(", ")}.\n`;
      }
      if (criteria.year_from || criteria.year_to) {
        prompt += `Year range: ${criteria.year_from || "any"} to ${criteria.year_to || "any"}.\n\n`;
      }
    }

    prompt +=
      "For each recommended film, include the full cast of main actors (not just the preferred ones). Do not limit the actor list only to the preferred ones — they should help guide film selection, but not filter the cast.\n" +
      "Return the following for each film: title, year, description, genres (as array), actors (as array), and director.\n\n" +
      "Return a JSON array with these objects, sorted by year in descending order.";
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

  private async filterExistingFilms(
    userId: string,
    recommendations: RecommendedFilmDTO[]
  ): Promise<RecommendedFilmDTO[]> {
    if (recommendations.length === 0) return [];

    // Get user's existing films
    const { data: userFilms, error } = await this.supabase.from("user_films").select("title").eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to fetch user films: ${error.message}`);
    }

    // Create a Set of existing titles for faster lookups
    const existingTitles = new Set(userFilms.map((film) => film.title.toLowerCase()));

    // Filter out films that the user already has
    return recommendations.filter((film) => !existingTitles.has(film.title.toLowerCase()));
  }

  async getRecommendations(userId: string, criteria?: RecommendationCriteria): Promise<RecommendationResponseDTO> {
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
          .eq("user_id", userId)
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

      let recommendations = this.parseRecommendations(response.choices[0].message.content);

      // Filter out films that the user already has
      recommendations = await this.filterExistingFilms(userId, recommendations);

      // Log the generation
      const { data: generationLog, error: logError } = await this.supabase
        .from("generation_logs")
        .insert({
          user_id: userId,
          criteria_hash: await this.generateCriteriaHash(criteria || null),
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
        user_id: userId,
        error_message: error instanceof Error ? error.message : "Unknown error",
        criteria_hash: await this.generateCriteriaHash(criteria || null),
        error_code: "GENERATION_ERROR",
        model: "openai/gpt-4o-mini",
      });

      throw error;
    }
  }
}
