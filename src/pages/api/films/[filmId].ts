import { z } from "zod";
import { FilmsService } from "@/lib/services/films.service";
import type { APIRoute } from "astro";

export const prerender = false;

// Validate filmId parameter
const filmIdSchema = z.coerce
  .number()
  .int()
  .positive()
  .transform((val) => Number(val));

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    // Ensure user is authenticated
    const { user } = locals;
    if (!user) {
      return new Response(null, { status: 401 });
    }

    // Validate filmId parameter
    const validationResult = filmIdSchema.safeParse(params.filmId);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid film ID format",
          details: validationResult.error.message,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const filmId = validationResult.data;

    // Delete the film
    const filmsService = new FilmsService(locals.supabase);
    await filmsService.deleteFilm(user.id, filmId);

    return new Response(null, { status: 204 });
  } catch (error) {
    // Handle known errors
    if (error instanceof Error) {
      if (error.message.includes("not found") || error.message.includes("not authorized")) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Log unexpected errors
    console.error("Error deleting film:", error);

    // Return generic error response
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
