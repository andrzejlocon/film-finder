import type { APIRoute } from "astro";
import { FilmsService } from "@/lib/services/films.service.ts";
import { createFilmCommandSchema, getFilmsQuerySchema } from "@/lib/schemas/films.schema.ts";
import { ZodError } from "zod";

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

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Get user session from locals
    const { user } = locals;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse and validate query parameters
    const url = new URL(request.url);
    const rawParams = Object.fromEntries(url.searchParams);
    const params = getFilmsQuerySchema.parse(rawParams);

    // Initialize service and fetch films
    const filmsService = new FilmsService(locals.supabase);
    const result = await filmsService.getUserFilms(user.id, params);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET /films:", error);

    if (error instanceof ZodError) {
      return new Response(
        JSON.stringify({
          error: "Invalid parameters",
          details: error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
