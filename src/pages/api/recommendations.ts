import type { APIRoute } from "astro";
import { RecommendationService } from "@/lib/services/recommendation.service.ts";
import { recommendationCriteriaSchema } from "@/lib/schemas/recommendations.schema.ts";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    if (!locals.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
        }),
        { status: 401 }
      );
    }

    const body = await request.json();
    const validationResult = recommendationCriteriaSchema.safeParse(body.criteria);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: validationResult.error.errors,
        }),
        { status: 400 }
      );
    }

    const recommendationService = new RecommendationService(locals.supabase);
    const recommendations = await recommendationService.getRecommendations(locals.user.id, validationResult.data);

    return new Response(JSON.stringify(recommendations), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error generating recommendations:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500 }
    );
  }
};
