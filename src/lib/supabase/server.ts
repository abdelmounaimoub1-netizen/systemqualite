import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";

import { env } from "@/lib/env";
import type { RoleSlug } from "@/types/database";
import type { UserContext } from "@/types/app";

export async function createSupabaseServerClient() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error(
      "Supabase server client is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot mutate cookies during render.
        }
      }
    }
  });
}

export async function getCurrentUserContext(options?: { redirectToAuth?: boolean }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    if (options?.redirectToAuth !== false) {
      redirect("/auth/sign-in");
    }

    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const { data: roleRecord } = profile?.role_id
    ? await supabase.from("roles").select("slug").eq("id", profile.role_id).maybeSingle()
    : { data: null };

  return {
    userId: user.id,
    email: user.email ?? "",
    profile: profile ?? null,
    role: (roleRecord?.slug as RoleSlug | undefined) ?? "employee"
  } satisfies UserContext;
}
