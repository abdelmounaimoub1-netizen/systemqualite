import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUserContext } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AuthenticatedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const context = await getCurrentUserContext();
  if (!context) return null;
  return <AppShell context={context}>{children}</AppShell>;
}
