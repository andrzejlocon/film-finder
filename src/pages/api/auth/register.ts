import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.client.ts";
import { z } from "zod";

const registerSchema = z
  .object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({
        user: data.user,
        session: data.session,
      }),
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: error.errors[0].message,
        }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred",
      }),
      { status: 500 }
    );
  }
};
