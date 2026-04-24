function readEnv(value: string | undefined) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export const env = {
  supabaseUrl: readEnv(process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey:
    readEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ??
    readEnv(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
  supabaseServiceRoleKey: readEnv(process.env.SUPABASE_SERVICE_ROLE_KEY),
  appUrl: readEnv(process.env.NEXT_PUBLIC_APP_URL) ?? "http://localhost:3000"
};

export function hasSupabaseEnv() {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function assertSupabaseEnv() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
  }
}
