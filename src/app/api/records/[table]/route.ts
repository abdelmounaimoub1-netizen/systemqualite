import { NextResponse } from "next/server";

import { getTableWriteRoles, normalizeRecordPayload, tableRegistry } from "@/lib/modules/registry";
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  const { table } = await params;
  const tableName = table as TableName;

  if (!tableRegistry.has(tableName)) {
    return NextResponse.json({ error: "Unsupported table." }, { status: 404 });
  }

  const context = await getCurrentUserContext({ redirectToAuth: false });

  if (!context) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as {
    id?: string;
    values?: Record<string, unknown>;
  };
  const values = body.values ?? {};
  const allowedRoles = getTableWriteRoles(tableName, values);

  if (!allowedRoles.includes(context.role)) {
    return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
  }

  const supabase = await createSupabaseServerClient();
  const payload = normalizeRecordPayload(tableName, values);

  passthroughKeys.forEach((key) => {
    if (key in values) {
      payload[key] = values[key];
    }
  });

  if (body.id) {
    const { data, error } = await supabase
      .from(tableName)
      .update(payload)
      .eq("id", body.id)
      .select("*")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
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

  return NextResponse.json({ data });
}
