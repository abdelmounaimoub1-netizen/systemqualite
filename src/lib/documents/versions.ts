import type { SupabaseClient } from "@supabase/supabase-js";

type DbClient = SupabaseClient;

type DocumentRow = {
  id: string;
  version_current: string | null;
  file_path: string | null;
  effective_date: string | null;
  status: string;
};

export async function promoteDocumentOnApproval(client: DbClient, documentId: string) {
  const { data: document, error } = await client
    .from("documents")
    .select("id,version_current,file_path,effective_date,status")
    .eq("id", documentId)
    .maybeSingle();

  if (error || !document) return;

  const doc = document as DocumentRow;
  if (doc.status !== "Approved") return;

  const today = new Date().toISOString().slice(0, 10);
  const updates: Record<string, unknown> = {};

  if (!doc.effective_date) {
    updates.effective_date = today;
  }

  await client.from("documents").update(updates).eq("id", documentId);

  const { data: versions } = await client
    .from("document_versions")
    .select("id,version_number,status")
    .eq("document_id", documentId)
    .order("created_at", { ascending: false })
    .limit(1);

  const latest = versions?.[0] as Record<string, unknown> | undefined;

  if (latest && latest.status !== "Approved") {
    await client
      .from("document_versions")
      .update({ status: "Approved", approval_date: today })
      .eq("id", latest.id);
  } else if (!latest && doc.version_current) {
    await client.from("document_versions").insert({
      document_id: documentId,
      version_number: doc.version_current,
      status: "Approved",
      approval_date: today,
      file_path: doc.file_path,
      change_summary: "Version approuvee via circuit de validation."
    });
  }
}
