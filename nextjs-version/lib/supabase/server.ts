// Server-side Supabase client
// Gebruikt in Server Components en API routes
// ✅ VEILIGER: Sessions worden opgeslagen in HTTP-only cookies
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Set cookies in Server Components werkt niet altijd
            // Dit wordt opgevangen in middleware
          }
        },
      },
    }
  );
}
