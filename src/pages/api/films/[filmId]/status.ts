import type { APIRoute } from "astro";
import { FilmsService } from "@/lib/services/films.service";
import { filmIdSchema, updateStatusSchema } from "@/lib/schemas/films.schema";
import { ZodError } from "zod";

export const prerender = false;

export const POST: APIRoute = async ({ params, request, locals }) => {
  try {
    // Ensure user is authenticated
    const { user } = locals;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate filmId from URL params
    const filmId = await filmIdSchema.parseAsync(params.filmId);

    // Validate request body
    const body = await request.json();
    const { new_status } = await updateStatusSchema.parseAsync(body);

    // Update film status
    const filmsService = new FilmsService(locals.supabase);
    const updatedFilm = await filmsService.updateFilmStatus(user.id, filmId, new_status);

    return new Response(JSON.stringify(updatedFilm), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response(JSON.stringify({ error: "Invalid request data", details: error.issues }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (error instanceof Error && error.message.includes("not found")) {
      return new Response(JSON.stringify({ error: "Film not found or you are not authorized to update it" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.error("Error updating film status:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
