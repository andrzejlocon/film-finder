import type { AstroGlobal } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.client";

export async function handleAuthPageRedirect(Astro: AstroGlobal) {
  const supabase = createSupabaseServerInstance({
    cookies: Astro.cookies,
    headers: Astro.request.headers,
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return Astro.redirect("/recommendations");
  }

  return null;
}
