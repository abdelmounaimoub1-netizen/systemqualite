import type { SupabaseClient } from "@supabase/supabase-js";

import { sendAppEmail } from "@/lib/email";
import { env } from "@/lib/env";

type DbClient = SupabaseClient;

type ApprovalRow = {
  id: string;
  document_id: string;
  step_order: number | null;
  approver_id: string | null;
  role_label: string | null;
  decision: string;
  due_date: string | null;
  signed_at: string | null;
  comment: string | null;
};

type DocumentRow = {
  id: string;
  document_code: string | null;
  title: string;
  status: string;
};

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDueDate(value: string | null) {
  if (!value) return "Non renseignee";
  return new Date(value).toLocaleDateString("fr-FR");
}

async function getApprovalContext(client: DbClient, approvalId: string) {
  const { data: approval, error: approvalError } = await client
    .from("document_approvals")
    .select("*")
    .eq("id", approvalId)
    .maybeSingle();

  if (approvalError || !approval) {
    throw new Error(approvalError?.message ?? "Visa introuvable.");
  }

  const approvalRow = approval as ApprovalRow;
  const [{ data: document }, { data: approver }] = await Promise.all([
    client.from("documents").select("*").eq("id", approvalRow.document_id).maybeSingle(),
    approvalRow.approver_id
      ? client.from("profiles").select("id,email,full_name").eq("id", approvalRow.approver_id).maybeSingle()
      : Promise.resolve({ data: null })
  ]);

  return {
    approval: approvalRow,
    document: document as DocumentRow | null,
    approver: approver as ProfileRow | null
  };
}

export async function syncDocumentApprovalStatus(client: DbClient, documentId: string) {
  const [{ data: document }, { data: approvals, error }] = await Promise.all([
    client.from("documents").select("id,status").eq("id", documentId).maybeSingle(),
    client.from("document_approvals").select("decision").eq("document_id", documentId)
  ]);

  if (error || !document || document.status === "Archived" || !approvals?.length) return;

  const decisions = approvals.map((approval) => String(approval.decision ?? "Pending"));
  const nextStatus = decisions.includes("Rejected")
    ? "Draft"
    : decisions.every((decision) => decision === "Approved" || decision === "Skipped")
      ? "Approved"
      : "Under Review";

  if (nextStatus === document.status) return;

  await client.from("documents").update({ status: nextStatus }).eq("id", documentId);
}

export async function sendDocumentSignatureRequestEmail(client: DbClient, approvalId: string) {
  const { approval, document, approver } = await getApprovalContext(client, approvalId);

  if (!document || !approver?.email || approval.decision !== "Pending") {
    return { sent: false };
  }

  const documentLabel = `${document.document_code ?? "Document"} - ${document.title}`;
  const documentUrl = `${env.appUrl}/documents/${document.id}`;
  const dueDate = formatDueDate(approval.due_date);
  const safeTitle = escapeHtml(documentLabel);
  const safeName = escapeHtml(approver.full_name ?? "Signataire");

  await sendAppEmail({
    to: approver.email,
    subject: `[QMS] Demande de signature - ${documentLabel}`,
    text: `
Bonjour ${approver.full_name ?? ""},

Une demande de signature documentaire vous attend.

Document: ${documentLabel}
Niveau: ${approval.step_order ?? "-"}
Role: ${approval.role_label ?? "Signature"}
Echeance: ${dueDate}

Ouvrir la fiche: ${documentUrl}
    `.trim(),
    html: `
<h3>Demande de signature documentaire</h3>
<p>Bonjour ${safeName},</p>
<p>Une demande de signature documentaire vous attend.</p>
<p><strong>Document:</strong> ${safeTitle}</p>
<p><strong>Niveau:</strong> ${approval.step_order ?? "-"}</p>
<p><strong>Role:</strong> ${escapeHtml(approval.role_label ?? "Signature")}</p>
<p><strong>Echeance:</strong> ${escapeHtml(dueDate)}</p>
<p><a href="${documentUrl}">Ouvrir la fiche document</a></p>
    `.trim()
  });

  return { sent: true };
}

export async function sendDocumentSignatureLateEmail(client: DbClient, approvalId: string) {
  const { approval, document, approver } = await getApprovalContext(client, approvalId);

  if (!document || !approver?.email || approval.decision !== "Pending") {
    return { sent: false };
  }

  const documentLabel = `${document.document_code ?? "Document"} - ${document.title}`;
  const documentUrl = `${env.appUrl}/documents/${document.id}`;
  const dueDate = formatDueDate(approval.due_date);

  await sendAppEmail({
    to: approver.email,
    subject: `[QMS] Retard de signature - ${documentLabel}`,
    text: `
Bonjour ${approver.full_name ?? ""},

La signature documentaire suivante est en retard.

Document: ${documentLabel}
Niveau: ${approval.step_order ?? "-"}
Echeance: ${dueDate}

Ouvrir la fiche: ${documentUrl}
    `.trim(),
    html: `
<h3>Retard de signature documentaire</h3>
<p>Bonjour ${escapeHtml(approver.full_name ?? "Signataire")},</p>
<p>La signature documentaire suivante est en retard.</p>
<p><strong>Document:</strong> ${escapeHtml(documentLabel)}</p>
<p><strong>Niveau:</strong> ${approval.step_order ?? "-"}</p>
<p><strong>Echeance:</strong> ${escapeHtml(dueDate)}</p>
<p><a href="${documentUrl}">Ouvrir la fiche document</a></p>
    `.trim()
  });

  return { sent: true };
}
