import { NextResponse } from "next/server";

import { getTableWriteRoles, normalizeRecordPayload, tableRegistry } from "@/lib/modules/registry";
import {
  sendDocumentSignatureRequestEmail,
  syncDocumentApprovalStatus
} from "@/lib/documents/signatures";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserContext, createSupabaseServerClient } from "@/lib/supabase/server";
import type { TableName } from "@/types/database";

const passthroughKeys = [
  "document_id",
  "form_id",
  "workflow_id",
  "audit_id",
  "customer_complaint_id",
  "record_id",
  "table_name"
] as const;

const signatureDecisionValues = ["Pending", "Approved", "Rejected", "Skipped"];
const selfSignatureFields = new Set(["decision", "signed_at", "comment"]);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  const { table } = await params;
  const tableName = table as TableName;

  if (!tableRegistry.has(tableName)) {
    return NextResponse.json({ error: "Table non prise en charge." }, { status: 404 });
  }

  const context = await getCurrentUserContext({ redirectToAuth: false });

  if (!context) {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  }

  const body = (await request.json()) as {
    id?: string;
    values?: Record<string, unknown>;
  };
  const values = body.values ?? {};
  const allowedRoles = getTableWriteRoles(tableName, values);

  const supabase = await createSupabaseServerClient();
  const payload = normalizeRecordPayload(tableName, values);

  if (tableName === "document_approvals") {
    const decision = String(payload.decision ?? values.decision ?? "");

    if (["Approved", "Rejected", "Skipped"].includes(decision) && !("signed_at" in values)) {
      payload.signed_at = new Date().toISOString();
    }

    if (decision === "Pending") {
      payload.signed_at = null;
    }
  }

  let canSelfSignDocumentApproval = false;

  if (tableName === "document_approvals" && body.id && !allowedRoles.includes(context.role)) {
    const requestedKeys = Object.keys(payload);
    const decision = String(payload.decision ?? "");
    const onlySignatureFields = requestedKeys.every((key) => selfSignatureFields.has(key));
    const validDecision = signatureDecisionValues.includes(decision);

    if (onlySignatureFields && validDecision) {
      const { data: existingApproval } = await supabase
        .from("document_approvals")
        .select("approver_id")
        .eq("id", body.id)
        .maybeSingle();

      canSelfSignDocumentApproval =
        String((existingApproval as Record<string, unknown> | null)?.approver_id ?? "") ===
        context.userId;
    }
  }

  if (!allowedRoles.includes(context.role) && !canSelfSignDocumentApproval) {
    return NextResponse.json({ error: "Droits insuffisants." }, { status: 403 });
  }

  passthroughKeys.forEach((key) => {
    if (key in values) {
      payload[key] = values[key];
    }
  });

  if (body.id) {
    const updateClient = canSelfSignDocumentApproval ? createSupabaseAdminClient() : supabase;
    const { data, error } = await updateClient
      .from(tableName)
      .update(payload)
      .eq("id", body.id)
      .select("*")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (tableName === "document_approvals" && data) {
      const approval = data as Record<string, unknown>;

      if (approval.document_id) {
        await syncDocumentApprovalStatus(updateClient, String(approval.document_id));
      }

      if (approval.decision === "Pending" && approval.approver_id) {
        await sendDocumentSignatureRequestEmail(updateClient, String(approval.id)).catch((error) => {
          console.error("Could not send signature request email:", error);
        });
      }
    }

    return NextResponse.json({ data });
  }

  const insertPayload = {
    ...payload,
    created_by: context.userId
  };

  const { data, error } = await supabase
    .from(tableName)
    .insert(insertPayload)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (tableName === "document_approvals" && data) {
    const approval = data as Record<string, unknown>;

    if (approval.document_id) {
      await syncDocumentApprovalStatus(supabase, String(approval.document_id));
    }

    if (approval.decision === "Pending" && approval.approver_id) {
      await sendDocumentSignatureRequestEmail(supabase, String(approval.id)).catch((emailError) => {
        console.error("Could not send signature request email:", emailError);
      });
    }
  }

  return NextResponse.json({ data });
}
