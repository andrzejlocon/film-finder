import type { APIRoute } from "astro";
import { FilmsService } from "@/lib/services/films.service.ts";
import { createFilmCommandSchema } from "@/lib/schemas/films.schema.ts";

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

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createFilmCommandSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: validationResult.error.errors,
        }),
        { status: 400 }
      );
    }

    // Create films using service with user ID from locals
    const filmsService = new FilmsService(locals.supabase);
    const createdFilms = await filmsService.createFilms(locals.user.id, validationResult.data);

    return new Response(JSON.stringify(createdFilms), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // Handle known error types
    if (error instanceof Error && error.message.includes("already exist")) {
      return new Response(JSON.stringify({ error: error.message }), { status: 409 });
    }

    // Log unexpected errors
    console.error("Error creating films:", error);

    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
};
