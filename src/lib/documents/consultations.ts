import type { SupabaseClient } from "@supabase/supabase-js";

type DbClient = SupabaseClient;

export async function logDocumentConsultation(
  client: DbClient,
  {
    documentId,
    userId,
    source = "Portail"
  }: {
    documentId: string;
    userId: string;
    source?: string;
  }
) {
  const { error } = await client.from("document_consultations").insert({
    document_id: documentId,
    user_id: userId,
    source,
    consulted_at: new Date().toISOString(),
    created_by: userId
  });

  if (error) {
    console.error("Could not log document consultation:", error.message);
  }
}
