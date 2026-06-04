import type { SupabaseClient } from "@supabase/supabase-js";

import { sendAppEmail } from "@/lib/email";
import { env } from "@/lib/env";

type DbClient = SupabaseClient;

type DocumentRow = {
  id: string;
  document_code: string | null;
  title: string;
  read_ack_required: boolean | null;
  diffusion_scope: string | null;
  status: string;
};

type DistributionRow = {
  id: string;
  document_id: string;
  recipient_id: string | null;
  status: string;
  due_date: string | null;
};

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  is_active: boolean | null;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function autoDistributeOnApproval(client: DbClient, documentId: string, createdBy: string) {
  const { data: document } = await client
    .from("documents")
    .select("id,document_code,title,read_ack_required,diffusion_scope,status")
    .eq("id", documentId)
    .maybeSingle();

  if (!document || (document as DocumentRow).status !== "Approved") {
    return { created: 0 };
  }

  const doc = document as DocumentRow;
  if (!doc.read_ack_required) {
    return { created: 0 };
  }

  const { count } = await client
    .from("document_distributions")
    .select("id", { count: "exact", head: true })
    .eq("document_id", documentId);

  if ((count ?? 0) > 0) {
    return { created: 0 };
  }

  const { data: profiles } = await client
    .from("profiles")
    .select("id,email,full_name,is_active")
    .eq("is_active", true);

  const recipients = ((profiles ?? []) as ProfileRow[]).filter((profile) => profile.id !== createdBy);
  if (recipients.length === 0) {
    return { created: 0 };
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);
  const dueDateIso = dueDate.toISOString().slice(0, 10);

  const rows = recipients.map((profile) => ({
    document_id: documentId,
    recipient_id: profile.id,
    recipient_group: doc.diffusion_scope ?? "Portail Qualite",
    channel: "Portail",
    requires_ack: true,
    status: "To Acknowledge",
    due_date: dueDateIso,
    created_by: createdBy
  }));

  const { data: inserted, error } = await client
    .from("document_distributions")
    .insert(rows)
    .select("id");

  if (error) {
    throw new Error(error.message);
  }

  for (const distribution of inserted ?? []) {
    await sendDistributionRequestEmail(client, String(distribution.id)).catch(() => undefined);
  }

  return { created: inserted?.length ?? 0 };
}

export async function sendDistributionRequestEmail(client: DbClient, distributionId: string) {
  const { data: distribution, error } = await client
    .from("document_distributions")
    .select("*")
    .eq("id", distributionId)
    .maybeSingle();

  if (error || !distribution) return { sent: false };

  const row = distribution as DistributionRow;
  if (row.status !== "To Acknowledge" || !row.recipient_id) return { sent: false };

  const [{ data: document }, { data: recipient }] = await Promise.all([
    client.from("documents").select("id,document_code,title").eq("id", row.document_id).maybeSingle(),
    client.from("profiles").select("id,email,full_name").eq("id", row.recipient_id).maybeSingle()
  ]);

  if (!document || !recipient?.email) return { sent: false };

  const label = `${document.document_code ?? "Document"} - ${document.title}`;
  const url = `${env.appUrl}/documents/${document.id}`;

  await sendAppEmail({
    to: recipient.email,
    subject: `[QMS] Accuse de lecture requis - ${label}`,
    text: `Bonjour ${recipient.full_name ?? ""},\n\nMerci d'accuser reception du document:\n${label}\n\n${url}`,
    html: `<p>Bonjour ${escapeHtml(recipient.full_name ?? "")},</p><p>Merci d'accuser reception du document <strong>${escapeHtml(label)}</strong>.</p><p><a href="${url}">Ouvrir le document</a></p>`
  });

  return { sent: true };
}

export async function markOverdueDistributions(client: DbClient) {
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await client
    .from("document_distributions")
    .select("id")
    .eq("status", "To Acknowledge")
    .lt("due_date", today);

  if (error || !data?.length) {
    return { updated: 0 };
  }

  const ids = data.map((row) => String(row.id));
  await client.from("document_distributions").update({ status: "Overdue" }).in("id", ids);

  return { updated: ids.length };
}
