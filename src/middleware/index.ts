import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.client";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/password-recovery",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/reset-password",
];

export const onRequest = defineMiddleware(async ({ request, cookies, redirect, locals }, next) => {
  const url = new URL(request.url);
  const isPublicPath = PUBLIC_PATHS.includes(url.pathname);

  // Skip auth check for public paths
  if (isPublicPath) {
    return next();
  }

  const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

  // Attach supabase client to locals
  locals.supabase = supabase;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // Add user to locals for use in components
  locals.user = {
    id: user.id,
    email: user.email,
  };

  return next();
});
