import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.client.ts";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();

    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return new Response(
        JSON.stringify({
          error: "Invalid email or password"
        }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({
        user: data.user,
        redirectTo: "/recommendations"
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred"
      }),
      { status: 500 }
    );
  }
};
