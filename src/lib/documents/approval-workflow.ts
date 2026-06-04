import type { SupabaseClient } from "@supabase/supabase-js";

import { sendDocumentSignatureRequestEmail, syncDocumentApprovalStatus } from "@/lib/documents/signatures";

type DbClient = SupabaseClient;

type ApprovalRow = {
  id: string;
  step_order: number | null;
  decision: string;
};

type DocumentRow = {
  id: string;
  owner_id: string | null;
  validation_level: number | null;
  approval_mode: string | null;
  status: string;
};

const ROLE_LABELS = ["Redacteur", "Verificateur", "Approbateur", "Approbateur qualite", "Direction"];

function addBusinessDays(from: Date, days: number) {
  const result = new Date(from);
  let added = 0;

  while (added < days) {
    result.setDate(result.getDate() + 1);
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      added += 1;
    }
  }

  return result;
}

export function getSequentialSignBlockReason(
  approvals: ApprovalRow[],
  currentApprovalId: string,
  decision: string
) {
  if (!["Approved", "Rejected", "Skipped"].includes(decision)) return null;

  const current = approvals.find((row) => row.id === currentApprovalId);
  if (!current) return "Visa introuvable.";

  const currentStep = Number(current.step_order ?? 0);
  const pendingEarlier = approvals.some(
    (row) =>
      Number(row.step_order ?? 0) < currentStep &&
      String(row.decision ?? "Pending") === "Pending"
  );

  if (pendingEarlier) {
    return "Le mode sequentiel exige la validation des niveaux precedents avant ce visa.";
  }

  return null;
}

export async function ensureApprovalSteps(
  client: DbClient,
  documentId: string,
  createdBy: string
) {
  const { data: document, error: documentError } = await client
    .from("documents")
    .select("id,owner_id,validation_level,approval_mode,status")
    .eq("id", documentId)
    .maybeSingle();

  if (documentError || !document) {
    throw new Error(documentError?.message ?? "Document introuvable.");
  }

  const doc = document as DocumentRow;
  const levelCount = Math.min(Math.max(Number(doc.validation_level ?? 2), 1), 5);

  const { data: existing } = await client
    .from("document_approvals")
    .select("id")
    .eq("document_id", documentId);

  if ((existing ?? []).length >= levelCount) {
    return { created: 0 };
  }

  if ((existing ?? []).length > 0) {
    return { created: 0 };
  }

  const dueDate = addBusinessDays(new Date(), 5).toISOString().slice(0, 10);
  const rows = Array.from({ length: levelCount }, (_, index) => ({
    document_id: documentId,
    step_order: index + 1,
    approver_id: index === 0 ? doc.owner_id : null,
    role_label: ROLE_LABELS[index] ?? `Niveau ${index + 1}`,
    decision: "Pending",
    due_date: dueDate,
    created_by: createdBy
  }));

  const { data: inserted, error } = await client
    .from("document_approvals")
    .insert(rows)
    .select("id,approver_id,decision");

  if (error) {
    throw new Error(error.message);
  }

  for (const approval of inserted ?? []) {
    if (approval.approver_id && approval.decision === "Pending") {
      await sendDocumentSignatureRequestEmail(client, String(approval.id)).catch(() => undefined);
    }
  }

  await client.from("documents").update({ status: "Under Review" }).eq("id", documentId);

  return { created: inserted?.length ?? 0 };
}

export async function submitDocumentForReview(
  client: DbClient,
  documentId: string,
  userId: string
) {
  const result = await ensureApprovalSteps(client, documentId, userId);
  await syncDocumentApprovalStatus(client, documentId);
  return result;
}
